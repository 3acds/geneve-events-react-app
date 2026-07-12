import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './ScrollProgressIndicator.css';

const SCROLL_STEP_COUNT = 4;
const SCROLL_STEPS = Array.from({ length: SCROLL_STEP_COUNT }, (_, index) => index);

const getPageMeasurements = () => {
  const root = document.documentElement;
  const body = document.body;
  const scrollHeight = Math.max(root?.scrollHeight || 0, body?.scrollHeight || 0);
  const viewportHeight = window.innerHeight || root?.clientHeight || 0;
  const maxScroll = Math.max(0, scrollHeight - viewportHeight);
  const scrollTop = Math.min(maxScroll, Math.max(0, window.scrollY || root?.scrollTop || 0));

  return { maxScroll, scrollTop };
};

const ScrollProgressIndicator = () => {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const [scrollState, setScrollState] = useState({ activeStep: 0, isScrollable: false });

  useEffect(() => {
    document.documentElement.classList.add('custom-scroll-indicator');
    return () => document.documentElement.classList.remove('custom-scroll-indicator');
  }, []);

  useEffect(() => {
    let frameId = null;
    let frameUsesTimeout = false;

    const measure = () => {
      frameId = null;
      const { maxScroll, scrollTop } = getPageMeasurements();
      const isScrollable = maxScroll > 1;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      const activeStep = Math.min(
        SCROLL_STEP_COUNT - 1,
        Math.round(progress * (SCROLL_STEP_COUNT - 1)),
      );

      setScrollState((currentState) => (
        currentState.activeStep === activeStep
        && currentState.isScrollable === isScrollable
          ? currentState
          : { activeStep, isScrollable }
      ));
    };

    const scheduleMeasure = () => {
      if (frameId !== null) return;
      if (typeof window.requestAnimationFrame === 'function') {
        frameUsesTimeout = false;
        frameId = window.requestAnimationFrame(measure);
      } else {
        frameUsesTimeout = true;
        frameId = window.setTimeout(measure, 16);
      }
    };

    window.addEventListener('scroll', scheduleMeasure, { passive: true });
    window.addEventListener('resize', scheduleMeasure);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleMeasure);
      resizeObserver.observe(document.body);
      const app = document.querySelector('.App');
      if (app) resizeObserver.observe(app);
    }

    measure();
    return () => {
      window.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
      resizeObserver?.disconnect();
      if (frameId !== null) {
        if (frameUsesTimeout) window.clearTimeout(frameId);
        else window.cancelAnimationFrame?.(frameId);
      }
    };
  }, [pathname]);

  const scrollToStep = (stepIndex) => {
    const { maxScroll } = getPageMeasurements();
    const targetPosition = maxScroll * (stepIndex / (SCROLL_STEP_COUNT - 1));
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: targetPosition,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  if (!scrollState.isScrollable) return null;

  return (
    <nav className="page-scroll-indicator" aria-label={t('scroll.navigationAria')}>
      {SCROLL_STEPS.map((stepIndex) => {
        const isActive = stepIndex === scrollState.activeStep;
        return (
          <button
            key={stepIndex}
            className={`page-scroll-step ${isActive ? 'active' : ''}`}
            type="button"
            aria-label={t('scroll.sectionLabel', {
              number: stepIndex + 1,
              total: SCROLL_STEP_COUNT,
            })}
            aria-current={isActive ? 'step' : undefined}
            onClick={() => scrollToStep(stepIndex)}
          >
            <span className="page-scroll-step-line" aria-hidden="true"></span>
          </button>
        );
      })}
    </nav>
  );
};

export default ScrollProgressIndicator;
