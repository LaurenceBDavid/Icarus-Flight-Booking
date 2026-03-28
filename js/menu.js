/* ============================================================================
   MENU.JS - Mobile Navigation & Profile Dropdown Handler (Fixed)
   ============================================================================ */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ========== ELEMENTS ==========
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');
  const body = document.body;
  const profileBtn = document.querySelector('.profile-btn');
  const profileDropdown = document.querySelector('.profile-dropdown');

  let menuOpen = false;

  // ========== HAMBURGER MENU TOGGLE ==========
  if (hamburger) {
    hamburger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      menuOpen = !menuOpen;
      
      if (menuOpen) {
        openMenu();
      } else {
        closeMenu();
      }
    });
  }

  // ========== OVERLAY CLICK TO CLOSE ==========
  if (navOverlay) {
    navOverlay.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  // ========== PREVENT MENU CONTAINER CLICKS FROM CLOSING ==========
  if (navLinks) {
    navLinks.addEventListener('click', function(e) {
      // Don't stop propagation for links, only for the container
      if (e.target === navLinks) {
        e.stopPropagation();
      }
    });
  }

  // ========== CLOSE MENU ONLY WHEN CLICKING NAV LINKS ==========
  if (navLinks) {
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        // Only close on mobile
        if (window.innerWidth <= 992) {
          setTimeout(() => {
            closeMenu();
          }, 150);
        }
      });
    });
  }

  // ========== HELPER FUNCTIONS ==========
  function openMenu() {
    menuOpen = true;
    if (hamburger) hamburger.classList.add('active');
    if (navLinks) navLinks.classList.add('active');
    if (navOverlay) navOverlay.classList.add('active');
    body.classList.add('menu-open');
    
    // Close profile dropdown when opening menu
    closeProfileDropdown();
  }

  function closeMenu() {
    menuOpen = false;
    if (hamburger) hamburger.classList.remove('active');
    if (navLinks) navLinks.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
    body.classList.remove('menu-open');
  }

  // ========== PROFILE DROPDOWN ==========
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = profileDropdown.classList.contains('show');
      
      if (isOpen) {
        closeProfileDropdown();
      } else {
        openProfileDropdown();
      }
    });

    // Prevent dropdown from closing when clicking inside it
    profileDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  function openProfileDropdown() {
    if (profileDropdown) {
      profileDropdown.classList.add('show');
      const chevron = profileBtn?.querySelector('.fa-chevron-down');
      if (chevron) {
        chevron.style.transform = 'rotate(180deg)';
      }
    }
  }

  function closeProfileDropdown() {
    if (profileDropdown) {
      profileDropdown.classList.remove('show');
      const chevron = profileBtn?.querySelector('.fa-chevron-down');
      if (chevron) {
        chevron.style.transform = 'rotate(0deg)';
      }
    }
  }

  // ========== CLOSE ON CLICK OUTSIDE ==========
  document.addEventListener('click', function(e) {
    // Don't close anything if clicking hamburger, menu, or profile elements
    if (hamburger && hamburger.contains(e.target)) return;
    if (navLinks && navLinks.contains(e.target)) return;
    if (profileBtn && profileBtn.contains(e.target)) return;
    if (profileDropdown && profileDropdown.contains(e.target)) return;
    
    // Close profile dropdown if clicking outside
    if (profileDropdown && profileDropdown.classList.contains('show')) {
      closeProfileDropdown();
    }
  });

  // ========== ESC KEY TO CLOSE ==========
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (menuOpen) {
        closeMenu();
      }
      if (profileDropdown && profileDropdown.classList.contains('show')) {
        closeProfileDropdown();
      }
    }
  });

  // ========== CLOSE MENU ON WINDOW RESIZE ==========
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 992) {
        closeMenu();
        closeProfileDropdown();
      }
    }, 250);
  });

  // ========== NAVBAR SHRINK ON SCROLL ==========
  const navbar = document.querySelector('.navbar');
  let lastScrollTop = 0;

  if (navbar) {
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 50) {
        navbar.classList.add('shrink');
      } else {
        navbar.classList.remove('shrink');
      }

      lastScrollTop = scrollTop;
    });
  }

  // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        // Close menu if on mobile
        if (window.innerWidth <= 992) {
          closeMenu();
        }

        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = target.offsetTop - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ========== INITIALIZE ==========
  console.log('Menu.js initialized successfully');
  
  // Make sure menu is closed on load
  closeMenu();
  closeProfileDropdown();

  // ========== EXPOSE PUBLIC API ==========
  window.IcarusMenu = {
    open: openMenu,
    close: closeMenu,
    isOpen: function() { return menuOpen; }
  };
});