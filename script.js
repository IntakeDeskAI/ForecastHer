/* ========================================
   ForecastHer — Landing Page Scripts
   ======================================== */

// --- Supabase Client ---
const SUPABASE_URL = 'https://rqdzxptzbrfnpmlaiijv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZHp4cHR6YnJmbnBtbGFpaWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NDM1NjMsImV4cCI6MjA4NzMxOTU2M30.deihTlAvI1vXyfRqPhJ6i5MQdnKadgM5p7V3uwasSog';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function submitToWaitlist(email, predictionIdea, source) {
  const { error } = await sb
    .from('waitlist')
    .insert([{
      email: email.trim().toLowerCase(),
      prediction_idea: predictionIdea || null,
      source: source
    }]);

  if (error) {
    if (error.code === '23505') {
      // Duplicate email — still show success (don't reveal existing users)
      return { success: true, duplicate: true };
    }
    console.error('Waitlist error:', error.message);
    return { success: false, message: error.message };
  }
  return { success: true, duplicate: false };
}

document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll-based fade-in animations ---
  const fadeTargets = document.querySelectorAll(
    '.card-problem, .market-card, .benefit-item, .testimonial, .stat-callout, .empowerment-text, .section-headline, .section-sub, .markets-note, .hero-social-proof'
  );

  fadeTargets.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  fadeTargets.forEach(el => observer.observe(el));

  // --- Odds bar animation on scroll ---
  const oddsFills = document.querySelectorAll('.odds-fill');
  oddsFills.forEach(fill => {
    const targetWidth = fill.style.width;
    fill.style.width = '0%';

    const oddsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fill.style.width = targetWidth;
          oddsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    oddsObserver.observe(fill);
  });

  // --- Form handling ---
  const modal = document.getElementById('success-modal');
  const modalClose = document.getElementById('modal-close');

  function showModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideModal();
  });

  function setButtonLoading(btn, loading) {
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Joining...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    } else {
      btn.textContent = btn.dataset.originalText || btn.textContent;
      btn.disabled = false;
      btn.style.opacity = '';
    }
  }

  // Hero form
  const heroForm = document.getElementById('hero-form');
  heroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = heroForm.querySelector('input[type="email"]').value;
    const btn = heroForm.querySelector('button');
    if (email) {
      setButtonLoading(btn, true);
      const result = await submitToWaitlist(email, null, 'hero_form');
      setButtonLoading(btn, false);
      if (result.success) {
        heroForm.reset();
        showModal();
      } else {
        alert('Something went wrong. Please try again.');
      }
    }
  });

  // Final form
  const finalForm = document.getElementById('final-form');
  finalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = finalForm.querySelector('input[type="email"]').value;
    const prediction = finalForm.querySelector('input[type="text"]').value;
    const btn = finalForm.querySelector('button');
    if (email) {
      setButtonLoading(btn, true);
      const result = await submitToWaitlist(email, prediction, 'final_form');
      setButtonLoading(btn, false);
      if (result.success) {
        finalForm.reset();
        showModal();
      } else {
        alert('Something went wrong. Please try again.');
      }
    }
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Stagger animation for market cards ---
  const marketCards = document.querySelectorAll('.market-card');
  marketCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 80}ms`;
  });

  // --- Stagger for problem cards ---
  const problemCards = document.querySelectorAll('.card-problem');
  problemCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 100}ms`;
  });

  // --- Stagger for benefit items ---
  const benefitItems = document.querySelectorAll('.benefit-item');
  benefitItems.forEach((item, i) => {
    item.style.transitionDelay = `${i * 80}ms`;
  });

  // --- Parallax-like effect on hero orbs ---
  const orbs = document.querySelectorAll('.orb');
  let ticking = false;

  // --- Floating CTA bar ---
  const floatingCta = document.getElementById('floating-cta');
  const heroSection = document.getElementById('hero');
  const finalCtaSection = document.getElementById('final-cta');

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        orbs.forEach((orb, i) => {
          const speed = (i + 1) * 0.03;
          orb.style.transform = `translateY(${scrollY * speed}px)`;
        });

        // Show floating CTA after scrolling past hero, hide near final CTA
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        const finalCtaTop = finalCtaSection.offsetTop - window.innerHeight;
        if (scrollY > heroBottom && scrollY < finalCtaTop) {
          floatingCta.classList.add('visible');
        } else {
          floatingCta.classList.remove('visible');
        }

        ticking = false;
      });
      ticking = true;
    }
  });

  // --- Live waitlist counter ---
  async function updateWaitlistCount() {
    try {
      const { data, error } = await sb.rpc('get_waitlist_count');
      if (!error && data !== null) {
        const displayCount = Math.max(data, 500);
        const text = displayCount >= 1000
          ? `${(displayCount / 1000).toFixed(1).replace(/\.0$/, '')}k+`
          : `${displayCount}+`;
        document.querySelectorAll('[id^="waitlist-count"]').forEach(el => {
          el.textContent = text;
        });
      }
    } catch (e) {
      // Silently fail — keep default "500+"
    }
  }

  updateWaitlistCount();

});
