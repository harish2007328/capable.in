import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, Check } from 'lucide-react';
import { calculateTaskLayout, getPhaseColorTheme } from '../utils/roadmapHelpers';

export const RoadmapCanvas = forwardRef(({
    project,
    isDarkMode,
    focusDayNum,
    setFocusDayNum,
    selectedDay,
    setSelectedDay,
    expandedDays,
    setExpandedDays,
    handleToggleDayExpand,
    handleToggleRoadmapTask,
    activeTab
}, ref) => {
    const [taskHeights, setTaskHeights] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const [hoveredDay, setHoveredDay] = useState(null);
    const [hoveredTask, setHoveredTask] = useState(null);
    const zoomScaleRef = useRef(1.2);
    const panOffsetRef = useRef({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const mouseDownPos = useRef({ x: 0, y: 0 });
    const canvasViewportRef = useRef(null);
    const canvasRef = useRef(null);
    const hasInitialCenteredRef = useRef(false);
    const centeringTimeoutRef = useRef(null);
    const roadmapCoordsRef = useRef(null);
    const pendingHeightsRef = useRef({});
    const rafIdRef = useRef(null);

    const roadmapPhases = project?.data?.roadmap?.phases || (project?.data?.roadmap?.days ? [
        { id: 0, title: "Validation Phase", days: project.data.roadmap.days }
    ] : []);
    
    const days = roadmapPhases.reduce((all, p) => [...all, ...(p.days || [])], []);

    const baseCenterY = 600;
    const MIN_COLLAPSED_DISTANCE = 95; 
    const GAP = 10;

    const getDayExtent = (day) => {
        if (!day) return { top: 35, bottom: 35 };
        const isExpanded = expandedDays[day.day];
        const halfCard = 35; 
        if (!isExpanded) return { top: halfCard, bottom: halfCard };
        
        const dayTasks = day.tasks || [];
        if (dayTasks.length === 0) return { top: halfCard, bottom: halfCard };
        
        const taskLayouts = calculateTaskLayout(dayTasks, 0, taskHeights);
        if (taskLayouts.length === 0) return { top: halfCard, bottom: halfCard };
        
        const firstTask = taskLayouts[0];
        const lastTask = taskLayouts[taskLayouts.length - 1];
        
        const topTaskY = firstTask.taskY - firstTask.height / 2;
        const bottomTaskY = lastTask.taskY + lastTask.height / 2;
        
        return {
            top: Math.max(halfCard, -topTaskY),
            bottom: Math.max(halfCard, bottomTaskY)
        };
    };

    const getDistance = (dayAbove, dayBelow, xAbove, xBelow, isLeft) => {
        const isAboveExpanded = !!expandedDays[dayAbove.day];
        const isBelowExpanded = !!expandedDays[dayBelow.day];
        const extAbove = getDayExtent(dayAbove);
        const extBelow = getDayExtent(dayBelow);
        
        let reqY = MIN_COLLAPSED_DISTANCE; // default 76
        
        // Check Case 2: Above Tasks vs Below Card
        if (isAboveExpanded) {
            const taskX_above = isLeft ? xAbove - 240 : xAbove + 240;
            const tasksMin = taskX_above - 100;
            const tasksMax = taskX_above + 100;
            const cardMin = xBelow - 90;
            const cardMax = xBelow + 90;
            if (tasksMin < cardMax && tasksMax > cardMin) {
                reqY = Math.max(reqY, extAbove.bottom + 12 + 35);
            }
        }
        
        // Check Case 3: Below Tasks vs Above Card
        if (isBelowExpanded) {
            const taskX_below = isLeft ? xBelow - 240 : xBelow + 240;
            const tasksMin = taskX_below - 100;
            const tasksMax = taskX_below + 100;
            const cardMin = xAbove - 90;
            const cardMax = xAbove + 90;
            if (tasksMin < cardMax && tasksMax > cardMin) {
                reqY = Math.max(reqY, 35 + 12 + extBelow.top);
            }
        }
        
        // Check Case 4: Above Tasks vs Below Tasks
        if (isAboveExpanded && isBelowExpanded) {
            const taskX_above = isLeft ? xAbove - 240 : xAbove + 240;
            const taskX_below = isLeft ? xBelow - 240 : xBelow + 240;
            const tasksAboveMin = taskX_above - 100;
            const tasksAboveMax = taskX_above + 100;
            const tasksBelowMin = taskX_below - 100;
            const tasksBelowMax = taskX_below + 100;
            if (tasksAboveMin < tasksBelowMax && tasksAboveMax > tasksBelowMin) {
                reqY = Math.max(reqY, extAbove.bottom + 12 + extBelow.top);
            }
        }
        
        return reqY;
    };

    // Calculate relative coordinates of days within each phase relative to phaseCenterY = 0
    const phaseRelativeLayouts = roadmapPhases.map((phase) => {
        const pDays = phase.days || [];
        const N_p = pDays.length;
        if (N_p === 0) return { daysCoords: [], minY: 0, maxY: 0 };

        const L = Math.ceil(N_p / 2);
        const leftDays = pDays.slice(0, L);
        const rightDays = pDays.slice(L);

        const leftYRelative = new Array(leftDays.length);
        const rightYRelative = new Array(rightDays.length);

        const getLeftX = (idx) => {
            const ratio = leftDays.length > 1 ? Math.abs(idx - (leftDays.length - 1) / 2) / ((leftDays.length - 1) / 2) : 0;
            return 470 + ratio * 75;
        };

        const getRightX = (idx) => {
            const ratio = rightDays.length > 1 ? Math.abs(idx - (rightDays.length - 1) / 2) / ((rightDays.length - 1) / 2) : 0;
            return 930 - ratio * 75;
        };

        // Calculate left column relative Y
        if (leftDays.length > 0) {
            const ML = Math.floor(leftDays.length / 2);
            leftYRelative[ML] = 0;
            // Go up
            for (let i = ML - 1; i >= 0; i--) {
                const prevY = leftYRelative[i + 1];
                const distance = getDistance(leftDays[i], leftDays[i + 1], getLeftX(i), getLeftX(i + 1), true);
                leftYRelative[i] = prevY - distance;
            }
            // Go down
            for (let i = ML + 1; i < leftDays.length; i++) {
                const prevY = leftYRelative[i - 1];
                const distance = getDistance(leftDays[i - 1], leftDays[i], getLeftX(i - 1), getLeftX(i), true);
                leftYRelative[i] = prevY + distance;
            }
        }

        // Calculate right column relative Y
        if (rightDays.length > 0) {
            const MR = Math.floor(rightDays.length / 2);
            rightYRelative[MR] = 0;
            // Go up
            for (let i = MR - 1; i >= 0; i--) {
                const prevY = rightYRelative[i + 1];
                const distance = getDistance(rightDays[i], rightDays[i + 1], getRightX(i), getRightX(i + 1), false);
                rightYRelative[i] = prevY - distance;
            }
            // Go down
            for (let i = MR + 1; i < rightDays.length; i++) {
                const prevY = rightYRelative[i - 1];
                const distance = getDistance(rightDays[i - 1], rightDays[i], getRightX(i - 1), getRightX(i), false);
                rightYRelative[i] = prevY + distance;
            }
        }

        // Find min Y and max Y for this phase relative to phaseCenterY = 0
        let pMinY = 0;
        let pMaxY = 0;

        const daysCoords = [];

        leftDays.forEach((day, idx) => {
            const y = leftYRelative[idx];
            const extent = getDayExtent(day);
            if (y - extent.top < pMinY) pMinY = y - extent.top;
            if (y + extent.bottom > pMaxY) pMaxY = y + extent.bottom;

            const ratio = leftDays.length > 1 ? Math.abs(idx - (leftDays.length - 1) / 2) / ((leftDays.length - 1) / 2) : 0;
            const x = 420 + ratio * 75; 

            daysCoords.push({ dayNum: day.day, x, relY: y, isLeft: true });
        });

        rightDays.forEach((day, idx) => {
            const y = rightYRelative[idx];
            const extent = getDayExtent(day);
            if (y - extent.top < pMinY) pMinY = y - extent.top;
            if (y + extent.bottom > pMaxY) pMaxY = y + extent.bottom;

            const ratio = rightDays.length > 1 ? Math.abs(idx - (rightDays.length - 1) / 2) / ((rightDays.length - 1) / 2) : 0;
            const x = 980 - ratio * 75; 

            daysCoords.push({ dayNum: day.day, x, relY: y, isLeft: false });
        });

        return { daysCoords, minY: pMinY, maxY: pMaxY };
    });

    // Compute absolute phaseCenterY for each phase (stacking Phase 0 at the bottom, others above)
    const phaseCenterY = new Array(roadmapPhases.length);
    const phaseGap = 130; 

    if (roadmapPhases.length > 0) {
        phaseCenterY[0] = 0;
        for (let p = 1; p < roadmapPhases.length; p++) {
            phaseCenterY[p] = phaseCenterY[p - 1] + phaseRelativeLayouts[p - 1].minY - phaseRelativeLayouts[p].maxY - phaseGap;
        }
    }

    // Find absolute min Y and max Y across all elements to determine canvas dimensions
    let absMinY = 0;
    let absMaxY = 0;

    roadmapPhases.forEach((phase, pIdx) => {
        const relLayout = phaseRelativeLayouts[pIdx];
        const centerY_p = phaseCenterY[pIdx];
        
        const topY = centerY_p + relLayout.minY;
        const bottomY = centerY_p + relLayout.maxY;

        if (topY < absMinY) absMinY = topY;
        if (bottomY > absMaxY) absMaxY = bottomY;
    });

    const canvasPadding = 120;
    const canvasHeight = Math.max(800, absMaxY - absMinY + 2 * canvasPadding);
    const shiftY = canvasPadding - absMinY;

    // Compute absolute Y coordinates
    const absolutePhaseCenterY = phaseCenterY.map(y => y + shiftY);
    const centerY = canvasHeight / 2;
    
    const roadmapCoords = (() => {
        if (days.length === 0) {
            return [
                { x: 520, y: 250 }, { x: 470, y: 600 }, { x: 520, y: 950 },
                { x: 880, y: 250 }, { x: 930, y: 600 }, { x: 880, y: 950 }
            ];
        }
        const coords = new Array(days.length);
        roadmapPhases.forEach((phase, pIdx) => {
            const centerY_p = absolutePhaseCenterY[pIdx];
            const relLayout = phaseRelativeLayouts[pIdx];
            
            relLayout.daysCoords.forEach(dCoord => {
                coords[dCoord.dayNum - 1] = {
                    x: dCoord.x,
                    y: centerY_p + dCoord.relY
                };
            });
        });
        return coords;
    })();

    roadmapCoordsRef.current = roadmapCoords;

    // Helper map to quickly retrieve phase index and side info for any day
    const dayDetails = {};
    roadmapPhases.forEach((phase, pIdx) => {
        const pDays = phase.days || [];
        const L = Math.ceil(pDays.length / 2);
        pDays.forEach((day, dIdx) => {
            dayDetails[day.day] = {
                phaseId: phase.id,
                phaseIndex: pIdx,
                isLeft: dIdx < L,
                phaseCenterY: absolutePhaseCenterY[pIdx]
            };
        });
    });

    const phaseProgress = (phase) => {
        const pDays = phase.days || [];
        let total = 0;
        let completed = 0;
        pDays.forEach(d => {
            if (d.tasks) {
                total += d.tasks.length;
                completed += d.tasks.filter(t => t.completed).length;
            }
        });
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    const measureTaskRef = (taskId) => (el) => {
        if (el) {
            const h = el.offsetHeight;
            if (h > 0 && taskHeights[taskId] !== h) {
                pendingHeightsRef.current[taskId] = h;
                if (!rafIdRef.current) {
                    rafIdRef.current = requestAnimationFrame(() => {
                        rafIdRef.current = null;
                        const batch = { ...pendingHeightsRef.current };
                        pendingHeightsRef.current = {};
                        setTaskHeights(prev => {
                            const next = { ...prev };
                            let changed = false;
                            for (const id in batch) {
                                if (next[id] !== batch[id]) {
                                    next[id] = batch[id];
                                    changed = true;
                                }
                            }
                            return changed ? next : prev;
                        });
                    });
                }
            }
        }
    };

    const centerOnDayNode = (dayNum, targetScale = 1.2, duration = 500, onComplete = null) => {
        if (centeringTimeoutRef.current) {
            clearTimeout(centeringTimeoutRef.current);
        }
        centeringTimeoutRef.current = setTimeout(() => {
            const viewport = canvasViewportRef.current;
            if (!viewport || !canvasRef.current || !project?.data?.roadmap?.days) {
                if (onComplete) onComplete();
                return;
            }

            const daysList = project.data.roadmap.days;
            const N = daysList.length;
            if (N === 0) {
                if (onComplete) onComplete();
                return;
            }

            const idx = dayNum - 1;
            const activeCoord = (roadmapCoordsRef.current && roadmapCoordsRef.current[idx]) || { x: 700, y: centerY };

            const rect = viewport.getBoundingClientRect();
            const viewportCenterX = rect.width / 2;
            const viewportCenterY = rect.height / 2;

            const targetX = viewportCenterX - activeCoord.x * targetScale;
            const targetY = viewportCenterY - activeCoord.y * targetScale;

            // Apply smooth transition temporarily
            if (canvasRef.current) {
                canvasRef.current.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
                zoomScaleRef.current = targetScale;
                panOffsetRef.current = { x: targetX, y: targetY };
                canvasRef.current.style.transform = `translate(${targetX}px, ${targetY}px) scale(${targetScale})`;
            }

            setTimeout(() => {
                if (canvasRef.current) {
                    canvasRef.current.style.transition = '';
                }
                if (onComplete) onComplete();
            }, duration);
        }, 50);
    };

    // Expose centerOnDayNode so parent VenturePage can center on auto-move
    useImperativeHandle(ref, () => ({
        centerOnDayNode
    }));

    useEffect(() => {
        setTaskHeights({});
    }, [project]);

    // Initial centering logic inside RoadmapCanvas
    useEffect(() => {
        if (activeTab !== 'navigator') {
            hasInitialCenteredRef.current = false;
            return;
        }
        if (hasInitialCenteredRef.current) return;

        const viewport = canvasViewportRef.current;
        if (!viewport) return;

        const handleCenter = () => {
            const daysList = project?.data?.roadmap?.days || [];
            const N = daysList.length;
            const initialScale = 1.2;
            const rect = viewport.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) return false;

            if (N > 0) {
                const targetDay = focusDayNum || 1;
                const idx = targetDay - 1;
                const activeCoord = roadmapCoords[idx] || { x: 700, y: centerY };

                const viewportCenterX = rect.width / 2;
                const viewportCenterY = rect.height / 2;

                const initialX = viewportCenterX - activeCoord.x * initialScale;
                const initialY = viewportCenterY - activeCoord.y * initialScale;

                panOffsetRef.current = { x: initialX, y: initialY };
                zoomScaleRef.current = initialScale;

                if (canvasRef.current) {
                    canvasRef.current.style.transform = `translate(${initialX}px, ${initialY}px) scale(${initialScale})`;
                }
                hasInitialCenteredRef.current = true;
                return true;
            } else if (N === 0) {
                const canvasWidth = 1400;
                const initialX = (rect.width - canvasWidth * initialScale) / 2;
                const initialY = (rect.height - canvasHeight * initialScale) / 2;
                panOffsetRef.current = { x: initialX, y: initialY };
                zoomScaleRef.current = initialScale;

                if (canvasRef.current) {
                    canvasRef.current.style.transform = `translate(${initialX}px, ${initialY}px) scale(${initialScale})`;
                }
                hasInitialCenteredRef.current = true;
                return true;
            }
            return true;
        };

        // Try centering immediately
        const success = handleCenter();
        if (success) return;

        // If not successful (rect.width === 0), observe resize
        const observer = new ResizeObserver(() => {
            const rect = viewport.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const done = handleCenter();
                if (done) {
                    observer.disconnect();
                }
            }
        });
        observer.observe(viewport);
        return () => observer.disconnect();
    }, [activeTab, project, focusDayNum, roadmapCoords]);

    // Setup mouse wheel zoom & scroll listeners
    useEffect(() => {
        const viewport = canvasViewportRef.current;
        if (!viewport) return;

        const handleWheel = (e) => {
            e.preventDefault();

            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (e.ctrlKey) {
                // Pinch zoom (centered on cursor)
                let delta = -e.deltaY;
                const maxDelta = 120;
                if (delta > maxDelta) delta = maxDelta;
                if (delta < -maxDelta) delta = -maxDelta;

                const zoomFactor = Math.exp(delta * 0.0015);
                const oldScale = zoomScaleRef.current;
                let newScale = oldScale * zoomFactor;
                newScale = Math.min(Math.max(newScale, 0.4), 3.0);

                const tx = mouseX - (mouseX - panOffsetRef.current.x) * (newScale / oldScale);
                const ty = mouseY - (mouseY - panOffsetRef.current.y) * (newScale / oldScale);

                zoomScaleRef.current = newScale;
                panOffsetRef.current = { x: tx, y: ty };
            } else {
                // Two-finger swipe / scroll pan
                panOffsetRef.current.x -= e.deltaX;
                panOffsetRef.current.y -= e.deltaY;
            }

            if (canvasRef.current) {
                canvasRef.current.style.transform = `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${zoomScaleRef.current})`;
            }
        };

        viewport.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            viewport.removeEventListener('wheel', handleWheel);
        };
    }, [activeTab, project]);

    const handleMouseDown = (e) => {
        // Prevent dragging if clicking elements inside cards
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) {
            return;
        }
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - panOffsetRef.current.x,
            y: e.clientY - panOffsetRef.current.y
        };
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        panOffsetRef.current = { x: dx, y: dy };

        if (canvasRef.current) {
            canvasRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(${zoomScaleRef.current})`;
        }
    };

    const handleMouseUpOrLeave = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };

    return (
        <div 
            ref={canvasViewportRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex-grow h-full relative overflow-hidden select-none transition-colors duration-300 ${
                isDarkMode ? 'bg-[#09090b]' : 'bg-[#F3F4F6]'
            } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
            {/* Edge blending gradients */}
            <div 
                className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-[42] transition-colors duration-300"
                style={{
                    background: `linear-gradient(to bottom, ${isDarkMode ? '#09090b' : '#F3F4F6'} 0%, transparent 100%)`
                }}
            />
            <div 
                className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-[42] transition-colors duration-300"
                style={{
                    background: `linear-gradient(to top, ${isDarkMode ? '#09090b' : '#F3F4F6'} 0%, transparent 100%)`
                }}
            />
            <div 
                className="absolute top-0 bottom-0 left-0 w-24 pointer-events-none z-[42] transition-colors duration-300"
                style={{
                    background: `linear-gradient(to right, ${isDarkMode ? '#09090b' : '#F3F4F6'} 0%, transparent 100%)`
                }}
            />
            <div 
                className="absolute top-0 bottom-0 right-0 w-24 pointer-events-none z-[42] transition-colors duration-300"
                style={{
                    background: `linear-gradient(to left, ${isDarkMode ? '#09090b' : '#F3F4F6'} 0%, transparent 100%)`
                }}
            />

            {/* Subtle Grid Backdrop */}
            <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                    backgroundImage: isDarkMode
                        ? 'radial-gradient(circle, rgba(255,255,255,0.035) 1.5px, transparent 1.5px)'
                        : 'radial-gradient(circle, rgba(0,0,0,0.045) 1.5px, transparent 1.5px)',
                    backgroundSize: '40px 40px'
                }} 
            />

            {/* Winding Canvas Content */}
            <div 
                ref={canvasRef}
                className="absolute top-0 left-0 w-[1400px] origin-top-left"
                style={{
                    transform: `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${zoomScaleRef.current})`,
                    height: `${canvasHeight}px`
                }}
            >
                {/* SVG laser lines path connecting days */}
                <svg 
                    width="1400" 
                    height={canvasHeight} 
                    className="absolute top-0 left-0 pointer-events-none overflow-visible z-[5]"
                >
                    <defs>
                        {/* Neon Glow Filters */}
                        <filter id="glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="glow-blue" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="glow-indigo" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="glow-sky" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Style sheet for connected lines animations */}
                    <style>{`
                        @keyframes laserFlow {
                            0% { stroke-dashoffset: 24; }
                            100% { stroke-dashoffset: 0; }
                        }
                        .laser-line-anim {
                            animation: laserFlow 1.5s linear infinite;
                        }
                        @keyframes activeLinePulse {
                            0% { opacity: 0.35; stroke-width: 1.8px; }
                            50% { opacity: 0.95; stroke-width: 2.8px; }
                            100% { opacity: 0.35; stroke-width: 1.8px; }
                        }
                        .active-line-pulse {
                            animation: activeLinePulse 2s ease-in-out infinite;
                        }
                    `}</style>

                    {/* Render Path Segments */}
                    {(() => {
                        const getRoundedOrthogonalPath = (x0, y0, x1, y1, radius = 16) => {
                            const xmid = (x0 + x1) / 2;
                            // Use epsilon threshold to prevent direction flip-flop for near-zero deltas
                            const isGoingRight = (x1 - x0) > 0.5;
                            const isGoingDown = (y1 - y0) > 0.5;
                            
                            const dx = isGoingRight ? 1 : -1;
                            const dy = isGoingDown ? 1 : -1;
                            
                            const rX = Math.min(radius, Math.abs(xmid - x0));
                            const rY = Math.min(radius, Math.abs(y1 - y0) / 2);
                            const r = Math.min(rX, rY);
                            
                            const startHorizontalSegment = xmid - dx * r;
                            const firstCurveControlX = xmid;
                            const firstCurveControlY = y0;
                            const firstCurveEndX = xmid;
                            const firstCurveEndY = y0 + dy * r;
                            
                            const verticalLineEndX = xmid;
                            const verticalLineEndY = y1 - dy * r;
                            
                            const secondCurveControlX = xmid;
                            const secondCurveControlY = y1;
                            const secondCurveEndX = xmid + dx * r;
                            const secondCurveEndY = y1;
                            
                            return `M ${x0} ${y0} L ${startHorizontalSegment} ${y0} Q ${firstCurveControlX} ${firstCurveControlY}, ${firstCurveEndX} ${firstCurveEndY} L ${verticalLineEndX} ${verticalLineEndY} Q ${secondCurveControlX} ${secondCurveControlY}, ${secondCurveEndX} ${secondCurveEndY} L ${x1} ${y1}`;
                        };

                        const paths = [];

                        // 1. Draw vertical connecting lines between consecutive phase cores
                        roadmapPhases.forEach((phase, pIdx) => {
                            if (pIdx > 0) {
                                const centerY_curr = absolutePhaseCenterY[pIdx];
                                const centerY_prev = absolutePhaseCenterY[pIdx - 1];
                                paths.push(
                                    <line 
                                        key={`phase-connector-${pIdx}`}
                                        x1="700" 
                                        y1={centerY_curr} 
                                        x2="700" 
                                        y2={centerY_prev} 
                                        stroke={isDarkMode ? '#27272a' : '#e4e4e7'} 
                                        strokeWidth="2" 
                                        strokeDasharray="6, 6" 
                                        className="transition-all duration-500 ease-in-out"
                                    />
                                );
                            }
                        });

                        // 2. Draw connections from cores to days and days to tasks
                        days.forEach((day) => {
                            const coord = roadmapCoords[day.day - 1] || { x: 700, y: centerY };
                            const details = dayDetails[day.day] || { isLeft: true, phaseCenterY: centerY };
                            const isExpanded = !!expandedDays[day.day];
                            const isCompleted = day.tasks && day.tasks.every(t => t.completed);
                            const isActive = focusDayNum === day.day;

                            let isLocked = false;
                            if (day.day > 1) {
                                const prevDay = days.find(d => d.day === day.day - 1);
                                if (prevDay) {
                                    const prevCompleted = prevDay.tasks?.every(t => t.completed);
                                    if (!prevCompleted) {
                                        isLocked = true;
                                    }
                                }
                            }

                            let segmentState = isLocked ? 'locked' : isCompleted ? 'completed' : isActive ? 'active' : 'unlocked';
                            const theme = getPhaseColorTheme(details.phaseIndex);
                            
                            let lineColor = isDarkMode ? '#2e3748' : '#cbd5e1'; 
                            if (segmentState === 'active') {
                                lineColor = isDarkMode ? theme.lineColorActiveDark : theme.lineColorActiveLight;
                            } else if (segmentState === 'completed') {
                                lineColor = isDarkMode ? '#3b82f6' : '#2563eb';
                            } else if (segmentState === 'unlocked') {
                                lineColor = isDarkMode ? theme.lineColorUnlockedDark : theme.lineColorUnlockedLight;
                            } else if (segmentState === 'locked') {
                                lineColor = isDarkMode ? '#2e3748' : '#cbd5e1';
                            }

                            const isLeft = details.isLeft;
                            const sX = isLeft ? 620 : 780;
                            const sY = details.phaseCenterY;
                            const endX = isLeft ? coord.x + 90 : coord.x - 90;
                            const endY = coord.y;

                            const pathD = getRoundedOrthogonalPath(sX, sY, endX, endY, 16);

                             paths.push(
                                <g key={`branch-${day.day}`}>
                                    {/* Core to Day path */}
                                    <path 
                                        d={pathD} 
                                        fill="none" 
                                        stroke={lineColor} 
                                        strokeWidth={segmentState === 'active' || segmentState === 'completed' ? "3" : "1.8"} 
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray={segmentState === 'locked' ? "4, 4" : "none"}
                                        filter={isDarkMode && (segmentState === 'active' || segmentState === 'completed') ? `url(#${theme.glow})` : undefined}
                                        className="transition-all duration-500 ease-in-out"
                                    />
                                    {/* Flowing laser overlay — always rendered for d-transition sync */}
                                    <g style={{ opacity: segmentState === 'active' ? 1 : 0 }} className="transition-opacity duration-500 ease-in-out">
                                        <path 
                                            d={pathD} 
                                            fill="none" 
                                            stroke={isDarkMode ? '#ffffff' : theme.accent}
                                            strokeWidth="2.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="active-line-pulse transition-all duration-500 ease-in-out"
                                        />
                                    </g>
                                    <circle cx={sX} cy={sY} r="4" fill={lineColor} stroke={isDarkMode ? "#09090b" : "#ffffff"} strokeWidth="1.5" className="transition-all duration-500 ease-in-out" />
                                    <circle cx={endX} cy={endY} r="4" fill={lineColor} stroke={isDarkMode ? "#09090b" : "#ffffff"} strokeWidth="1.5" className="transition-all duration-500 ease-in-out" />
                                    
                                    {/* Day to Task sub-branches */}
                                    {(() => {
                                        const dayTasks = day.tasks || [];
                                        const taskLayouts = calculateTaskLayout(dayTasks, coord.y, taskHeights);
                                        return dayTasks.map((task, tIdx) => {
                                            const { taskY } = taskLayouts[tIdx] || { taskY: coord.y };
                                            const taskX = isLeft ? coord.x - 240 : coord.x + 240;

                                            const tStartX = isLeft ? coord.x - 90 : coord.x + 90;
                                            const tStartY = coord.y;
                                            
                                            const tEndXFull = isLeft ? taskX + 100 : taskX - 100;
                                            const tEndYFull = taskY;

                                            // Collapse endpoint to start so path retracts smoothly via d-attribute transition
                                            const tEndX = isExpanded ? tEndXFull : tStartX;
                                            const tEndY = isExpanded ? tEndYFull : tStartY;

                                            const tPathD = getRoundedOrthogonalPath(tStartX, tStartY, tEndX, tEndY, 12);

                                            let tLineColor = isDarkMode ? '#2e3748' : '#cbd5e1';
                                            if (isLocked) {
                                                tLineColor = isDarkMode ? '#2e3748' : '#cbd5e1';
                                            } else if (task.completed) {
                                                tLineColor = isDarkMode ? '#3b82f6' : '#2563eb';
                                            } else if (isActive) {
                                                tLineColor = isDarkMode ? theme.lineColorActiveDark : theme.lineColorActiveLight;
                                            } else {
                                                tLineColor = isDarkMode ? theme.lineColorUnlockedDark : theme.lineColorUnlockedLight;
                                            }

                                            return (
                                                <g 
                                                    key={`task-branch-${day.day}-${task.id}`}
                                                    className="transition-opacity duration-500 ease-in-out"
                                                    style={{
                                                        opacity: isExpanded ? 1 : 0,
                                                        pointerEvents: 'none'
                                                    }}
                                                >
                                                    <path 
                                                        d={tPathD} 
                                                        fill="none" 
                                                        stroke={tLineColor} 
                                                        strokeWidth={task.completed || isActive ? "2.5" : "1.5"} 
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeDasharray={isLocked ? "3, 3" : "none"}
                                                        filter={isDarkMode && (task.completed || (isActive && !isLocked)) ? `url(#${theme.glow})` : undefined}
                                                        className="transition-all duration-500 ease-in-out"
                                                    />
                                                    {/* Flowing laser overlay — always rendered for d-transition sync */}
                                                    <g style={{ opacity: (isActive && !isLocked && !task.completed) ? 1 : 0 }} className="transition-opacity duration-500 ease-in-out">
                                                        <path 
                                                            d={tPathD} 
                                                            fill="none" 
                                                            stroke={isDarkMode ? '#ffffff' : theme.accent}
                                                            strokeWidth="1.5" 
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="active-line-pulse transition-all duration-500 ease-in-out"
                                                        />
                                                    </g>
                                                    <circle cx={tStartX} cy={tStartY} r="3" fill={tLineColor} stroke={isDarkMode ? "#09090b" : "#ffffff"} strokeWidth="1" className="transition-all duration-500 ease-in-out" />
                                                    <circle cx={tEndX} cy={tEndY} r="3" fill={tLineColor} stroke={isDarkMode ? "#09090b" : "#ffffff"} strokeWidth="1" className="transition-all duration-500 ease-in-out" />
                                                </g>
                                            );
                                        });
                                    })()}
                                </g>
                            );
                        });

                        return paths;
                    })()}
                </svg>

                {/* Central Core Nodes (one per phase) */}
                {roadmapPhases.map((phase, pIdx) => {
                    const centerY_p = absolutePhaseCenterY[pIdx];
                    const pct = phaseProgress(phase);
                    const theme = getPhaseColorTheme(pIdx);
                    return (
                        <div 
                            key={`core-${phase.id}`}
                            className={`absolute w-[160px] h-[68px] rounded-xl p-3 flex flex-col justify-center items-center gap-1 select-none transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                                isDarkMode 
                                    ? `bg-[#0f1f3d] border-blue-500/40 text-white shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.12),_0_8px_24px_rgba(0,0,0,0.4)]` 
                                    : `bg-[#1e40af] border-blue-700 text-white shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.22),_0_8px_20px_rgba(30,64,175,0.2)]`
                            } z-40`}
                            style={{
                                left: '700px',
                                top: `${centerY_p}px`
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 dark:from-white/10 dark:to-white/15 animate-pulse pointer-events-none rounded-xl" />

                            <div className="w-full flex flex-col items-center gap-1 relative z-10">
                                <span className="text-[8.5px] font-black tracking-widest uppercase text-center truncate w-full text-white/95" title={phase.title}>
                                    {phase.title.toUpperCase()}
                                </span>
                                <div className="h-2 w-[120px] rounded-full overflow-hidden relative bg-black/30 border border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
                                     <div 
                                         className="h-full bg-white rounded-full transition-all duration-500 ease-out shadow-[0_0_6px_#ffffff]" 
                                         style={{ 
                                             width: `${pct}%`,
                                         }} 
                                     />
                                 </div>
                                <span className="text-[8.5px] font-bold text-white/80">
                                    {pct}% COMPLETED
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Render Day Progress Nodes */}
                {(() => {
                    return days.map((day, idx) => {
                        const coord = roadmapCoords[day.day - 1] || { x: 700, y: centerY };
                        const details = dayDetails[day.day] || { isLeft: true, phaseCenterY: centerY, phaseIndex: 0 };
                        const theme = getPhaseColorTheme(details.phaseIndex);
                        const dayTasks = day.tasks || [];
                        const totalCount = dayTasks.length;
                        const completedCount = dayTasks.filter(t => t.completed).length;
                        const isCompleted = totalCount > 0 && completedCount === totalCount;
                        const isActive = focusDayNum === day.day;

                        let isLocked = false;
                        if (day.day > 1) {
                            const prevDay = days.find(d => d.day === day.day - 1);
                            if (prevDay) {
                                const prevCompleted = prevDay.tasks?.every(t => t.completed);
                                if (!prevCompleted) {
                                    isLocked = true;
                                }
                            }
                        }
                        const progressFraction = totalCount > 0 ? completedCount / totalCount : 0;
                        const isExpanded = !!expandedDays[day.day];
                        return (
                            <div
                                key={day.day}
                                onClick={() => {
                                    setSelectedDay(day.day);
                                    const isAlreadyFocused = focusDayNum === day.day;
                                    setFocusDayNum(day.day);
                                    centerOnDayNode(day.day, 1.2);
                                    if (!isAlreadyFocused) {
                                        if (!expandedDays[day.day]) {
                                            handleToggleDayExpand(day.day);
                                        }
                                    } else {
                                        handleToggleDayExpand(day.day);
                                    }
                                }}
                                onMouseEnter={() => setHoveredDay(day.day)}
                                onMouseLeave={() => setHoveredDay(null)}
                                className={`absolute w-[180px] min-h-[70px] rounded-xl border px-4 py-3 flex flex-col gap-1.5 transition-all duration-500 ease-in-out select-none group ${
                                    isLocked 
                                        ? (isDarkMode 
                                            ? 'bg-zinc-900/40 border-zinc-800 text-zinc-500 backdrop-blur-sm' 
                                            : 'bg-zinc-100/60 border-zinc-200 text-zinc-400 backdrop-blur-sm')
                                        : isActive 
                                            ? (isDarkMode 
                                                ? `${theme.activeBgDark} ${theme.activeBorder} text-white ring-1 ${theme.activeRing} hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]` 
                                                : `${theme.activeBgLight} ${theme.activeBorder} text-white ring-1 ${theme.activeRingLight} hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]`)
                                            : isCompleted 
                                                ? (isDarkMode 
                                                    ? 'bg-[#101b35]/90 border-blue-500/60 text-blue-100 hover:border-blue-400 hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)]' 
                                                    : 'bg-[#f0f5ff] border-blue-300 text-blue-900 hover:border-blue-400 hover:shadow-[0_4px_12px_rgba(59,130,246,0.05)]')
                                                : (isDarkMode 
                                                    ? `bg-[#0e1526]/95 border-blue-950/80 text-zinc-300 backdrop-blur-md hover:${theme.borderDark} hover:bg-[#121b30]/95 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]` 
                                                    : `bg-[#f5f8ff]/95 border-blue-100 text-slate-700 backdrop-blur-md hover:${theme.borderLight} hover:bg-[#eef2ff]/95 hover:shadow-[0_4px_12px_rgba(59,130,246,0.03)]`)
                                }`}
                                style={{
                                    left: `${coord.x}px`,
                                    top: `${coord.y}px`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: hoveredDay === day.day ? 100 : (isActive ? 30 : isLocked ? 10 : 20),
                                    cursor: 'pointer'
                                }}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 dark:from-white/10 dark:to-white/20 animate-pulse pointer-events-none rounded-xl" />
                                )}

                                <div className="flex items-center justify-between w-full relative z-10">
                                    <span className={`text-[8px] font-black tracking-widest uppercase ${
                                        isLocked 
                                            ? (isDarkMode ? 'text-zinc-500' : 'text-zinc-500')
                                            : isActive 
                                                ? theme.textActive
                                                : isCompleted 
                                                    ? (isDarkMode ? 'text-sky-300' : 'text-blue-700')
                                                    : (isDarkMode ? theme.textDark : theme.textLight)
                                    }`}>
                                        DAY {day.day}
                                    </span>

                                    <span className={`text-[8px] font-bold shrink-0 px-1.5 py-0.5 rounded-full ${
                                        isLocked 
                                            ? (isDarkMode ? 'bg-zinc-800/40 border border-zinc-700/50 text-zinc-400' : 'bg-zinc-200/60 border border-zinc-300 text-zinc-600')
                                            : isActive 
                                                ? 'bg-white/20 border border-white/30 text-white'
                                                : isCompleted 
                                                    ? (isDarkMode ? 'bg-blue-950/50 border border-blue-800/40 text-blue-300' : 'bg-blue-100/60 border border-blue-300 text-blue-700')
                                                    : (isDarkMode ? theme.badgeBgDark : theme.badgeBgLight)
                                    }`}>
                                        {completedCount}/{totalCount} Tasks
                                    </span>
                                </div>
                                
                                <h4 className={`text-[10px] font-bold leading-tight truncate relative z-10 ${
                                    isLocked 
                                        ? (isDarkMode ? 'text-zinc-400' : 'text-zinc-700')
                                        : isActive 
                                            ? 'text-white font-extrabold' 
                                            : isCompleted
                                                ? (isDarkMode ? 'text-zinc-200' : 'text-slate-800')
                                                : (isDarkMode ? 'text-zinc-200' : 'text-slate-800')
                                }`}>
                                    {day.title}
                                </h4>

                                {isLocked ? (
                                    <div className="text-[8px] font-bold flex items-center gap-1 mt-auto relative z-10 text-zinc-500">
                                        <Lock size={9} className="stroke-[2.5px]" /> Locked
                                    </div>
                                ) : isCompleted ? (
                                    <div className={`text-[8.5px] font-bold flex items-center gap-1 mt-auto relative z-10 ${
                                        isDarkMode ? 'text-sky-300' : 'text-blue-700'
                                    }`}>
                                        <Check size={9} className="stroke-[3px]" /> Completed
                                    </div>
                                ) : (
                                    <div className="w-full mt-auto relative z-10">
                                         <div className={`h-2 w-full rounded-full overflow-hidden ${
                                             isActive 
                                                 ? 'bg-black/25 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]' 
                                                 : isDarkMode 
                                                     ? 'bg-zinc-950/80 border border-zinc-800/60 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.7)]' 
                                                     : 'bg-slate-100 border border-slate-200/80 shadow-[inset_0_1px_2.5px_rgba(0,0,0,0.06)]'
                                         }`}>
                                             <div 
                                                 className={`h-full rounded-full transition-all duration-500 ease-out ${
                                                     isActive 
                                                         ? 'bg-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.85)]' 
                                                         : `${theme.progressFill} shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35)]`
                                                 }`} 
                                                 style={{ 
                                                     width: `${progressFraction * 100}%`,
                                                     boxShadow: (progressFraction > 0 && !isActive) ? `0 0 6px ${theme.accent}` : (progressFraction > 0 && isActive) ? '0 0 6px #ffffff' : 'none'
                                                 }}
                                             />
                                         </div>
                                    </div>
                                )}

                                {/* Expand/Collapse Toggle Indicator Button */}
                                {(() => {
                                    const isLeft = details.isLeft;
                                    return (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDay(day.day);
                                                setFocusDayNum(day.day);
                                                centerOnDayNode(day.day, 1.2);
                                                handleToggleDayExpand(day.day);
                                            }}
                                            className={`absolute top-1/2 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 z-30 shadow-md -translate-y-1/2 cursor-pointer hover:scale-110 active:scale-95 ${
                                                isLeft ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
                                            } ${
                                                isDarkMode 
                                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700' 
                                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 shadow-sm'
                                            }`}
                                        >
                                            {isLeft ? (
                                                isExpanded ? <ChevronRight size={10} className="stroke-[2.5px]" /> : <ChevronLeft size={10} className="stroke-[2.5px]" />
                                            ) : (
                                                isExpanded ? <ChevronLeft size={10} className="stroke-[2.5px]" /> : <ChevronRight size={10} className="stroke-[2.5px]" />
                                            )}
                                        </button>
                                    );
                                })()}

                                {/* Custom Styled Tooltip */}
                                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 opacity-0 scale-95 origin-bottom pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 rounded-lg p-2 shadow-lg border backdrop-blur-md text-left flex flex-col ${
                                    isDarkMode 
                                        ? 'bg-[#0b1329]/95 border-blue-500/20 text-zinc-300 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)]' 
                                        : 'bg-white/95 border-blue-150 text-slate-700 shadow-[0_8px_20px_-5px_rgba(59,130,246,0.08)]'
                                }`}>
                                    <p className="text-[8.5px] leading-snug font-semibold text-center">
                                        {isLocked 
                                            ? `Complete Day ${day.day - 1} tasks to unlock.` 
                                            : isCompleted 
                                                ? 'All tasks are finished.' 
                                                : isActive 
                                                    ? 'Complete tasks to advance.' 
                                                    : 'Ready to start brainstorming.'}
                                    </p>
                                    {/* Tooltip pointer arrow */}
                                    <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${
                                        isDarkMode ? 'bg-[#0b1329] border-blue-500/20' : 'bg-white border-blue-150' }`} style={{ marginTop: '-4.5px' }} />
                                </div>
                            </div>
                        );
                    });
                })()}

                {/* Render Task Sub-Branches Badges */}
                {(() => {
                     return days.map((day) => {
                         const coord = roadmapCoords[day.day - 1] || { x: 700, y: centerY };
                         const details = dayDetails[day.day] || { isLeft: true, phaseIndex: 0 };
                         const theme = getPhaseColorTheme(details.phaseIndex);
                         const dayTasks = day.tasks || [];
                         const isLeft = details.isLeft;

                         let isLocked = false;
                         if (day.day > 1) {
                             const prevDay = days.find(d => d.day === day.day - 1);
                             if (prevDay) {
                                 const prevCompleted = prevDay.tasks?.every(t => t.completed);
                                 if (!prevCompleted) {
                                     isLocked = true;
                                 }
                             }
                         }

                         const isActive = focusDayNum === day.day;
                         const isExpanded = !!expandedDays[day.day];
                         const taskLayouts = calculateTaskLayout(dayTasks, coord.y, taskHeights);

                         return dayTasks.map((task, tIdx) => {
                              const { taskY } = taskLayouts[tIdx] || { taskY: coord.y };
                              const taskX = isLeft ? coord.x - 240 : coord.x + 240;

                              return (
                                   <div
                                       key={`task-node-${day.day}-${task.id}`}
                                       ref={measureTaskRef(task.id)}
                                       onClick={() => {
                                           if (isLocked) return;
                                           handleToggleRoadmapTask(day.day, task.id);
                                       }}
                                       onMouseEnter={() => setHoveredTask(task.id)}
                                       onMouseLeave={() => setHoveredTask(null)}
                                       className={`absolute w-[200px] min-h-[40px] rounded-md px-3 py-2 flex items-center gap-2 border shadow-sm transition-all duration-500 ease-in-out select-none z-20 group ${
                                           isLocked
                                               ? (isDarkMode 
                                                   ? 'bg-[#0c0c0e]/60 border-zinc-900 text-zinc-500 opacity-50 cursor-not-allowed shadow-none' 
                                                   : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed shadow-none')
                                               : isActive
                                                   ? task.completed
                                                       ? (isDarkMode
                                                           ? theme.activeCompletedTaskBgDark
                                                           : theme.activeCompletedTaskBgLight)
                                                       : (isDarkMode
                                                           ? theme.activeTaskBgDark
                                                           : theme.activeTaskBgLight)
                                                   : task.completed
                                                       ? (isDarkMode
                                                           ? theme.inactiveCompletedTaskBgDark
                                                           : theme.inactiveCompletedTaskBgLight)
                                                       : (isDarkMode 
                                                           ? theme.inactiveTaskBgDark
                                                           : theme.inactiveTaskBgLight)
                                       }`}
                                       style={{
                                           left: isExpanded ? `${taskX}px` : `${coord.x}px`,
                                           top: isExpanded ? `${taskY}px` : `${coord.y}px`,
                                           transform: isExpanded ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.1)',
                                           opacity: isExpanded ? 1 : 0,
                                           pointerEvents: isExpanded ? 'auto' : 'none',
                                           zIndex: hoveredTask === task.id ? 100 : 15
                                       }}
                                   >
                                       <div className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0 transition-all duration-300 ${
                                           isLocked
                                               ? 'border-zinc-800 dark:border-zinc-900 bg-zinc-950/20 text-zinc-500'
                                               : task.completed
                                                   ? 'bg-blue-600 border-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),_0_2px_4px_rgba(37,99,235,0.3)] scale-[1.05]'
                                                   : isActive
                                                       ? theme.checkboxActive
                                                       : 'border-zinc-350 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 hover:border-blue-500 dark:hover:border-blue-500/80 hover:bg-blue-500/10'
                                       }`}>
                                           {isLocked ? (
                                               <Lock size={8} className="stroke-[2.5px]" />
                                           ) : task.completed ? (
                                               <Check size={10} className="stroke-[3.5px] text-white" />
                                           ) : null}
                                       </div>

                                       <span className={`text-[9.5px] leading-normal font-semibold text-left ${
                                           task.completed ? 'opacity-50 line-through' : ''
                                       }`}>
                                           {task.text}
                                       </span>

                                       {/* Custom Styled Tooltip */}
                                       <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 opacity-0 scale-95 origin-bottom pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 rounded-lg p-2 shadow-lg border backdrop-blur-md text-left flex flex-col ${
                                           isDarkMode 
                                               ? 'bg-[#0b1329]/95 border-blue-500/20 text-zinc-300 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)]' 
                                               : 'bg-white/95 border-blue-150 text-slate-700 shadow-[0_8px_20px_-5px_rgba(59,130,246,0.08)]'
                                       }`}>
                                           <p className="text-[8.5px] leading-snug font-semibold text-center">
                                               {isLocked 
                                                   ? `Complete Day ${day.day - 1} tasks to unlock.` 
                                                   : task.completed 
                                                       ? 'Click checkbox to activate.' 
                                                       : 'Click to mark as completed.'}
                                           </p>
                                           {/* Tooltip pointer arrow */}
                                           <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${
                                               isDarkMode 
                                                   ? 'bg-[#0b1329] border-blue-500/20' 
                                                   : 'bg-white border-blue-150'
                                           }`} style={{ marginTop: '-4.5px' }} />
                                       </div>
                                   </div>
                              );
                         });
                     });
                })()}
            </div>

            {/* Floating Zoom & Controls HUD */}
            <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border backdrop-blur-md shadow-xl ${
                isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white/90 border-zinc-200 text-zinc-800'
            }`}>
               <button 
                   onClick={() => {
                       const oldScale = zoomScaleRef.current;
                       const newScale = Math.min(oldScale + 0.15, 3.0);
                       zoomScaleRef.current = newScale;
                       if (canvasRef.current) {
                           canvasRef.current.style.transform = `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${newScale})`;
                       }
                   }}
                   className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded-xl cursor-pointer transition-colors ${
                       isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-600'
                   }`}
                   title="Zoom In"
               >
                   +
               </button>
               <div className={`w-[1px] h-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
               
               <span className="text-[10px] font-mono font-bold px-2">
                   {Math.round(zoomScaleRef.current * 100)}%
               </span>
               
               <div className={`w-[1px] h-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
               <button 
                   onClick={() => {
                       const oldScale = zoomScaleRef.current;
                       const newScale = Math.max(oldScale - 0.15, 0.4);
                       zoomScaleRef.current = newScale;
                       if (canvasRef.current) {
                           canvasRef.current.style.transform = `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${newScale})`;
                       }
                   }}
                   className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded-xl cursor-pointer transition-colors ${
                       isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-600'
                   }`}
                   title="Zoom Out"
               >
                   -
               </button>
               <div className={`w-[1px] h-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
               <button 
                   onClick={() => {
                       centerOnDayNode(focusDayNum, 1.2);
                   }}
                   className={`px-3 h-8 flex items-center justify-center text-[10px] font-bold rounded-xl cursor-pointer transition-colors ${
                       isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-600'
                   }`}
                   title="Recenter view on active day"
               >
                   Recenter
               </button>
               <div className={`w-[1px] h-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
               <button 
                   onClick={() => {
                       const daysList = project?.data?.roadmap?.days || [];
                       const nextExpanded = {};
                       daysList.forEach(d => { nextExpanded[d.day] = true; });
                       setExpandedDays(nextExpanded);
                   }}
                   className={`px-3 h-8 flex items-center justify-center text-[10px] font-bold rounded-xl cursor-pointer transition-colors ${
                       isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-600'
                   }`}
                   title="Expand all days"
               >
                   Expand All
               </button>
               <div className={`w-[1px] h-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
               <button 
                   onClick={() => {
                       setExpandedDays({});
                   }}
                   className={`px-3 h-8 flex items-center justify-center text-[10px] font-bold rounded-xl cursor-pointer transition-colors ${
                       isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-600'
                   }`}
                   title="Collapse all days"
               >
                   Collapse All
               </button>
            </div>
        </div>
    );
});

RoadmapCanvas.displayName = 'RoadmapCanvas';
export default RoadmapCanvas;
