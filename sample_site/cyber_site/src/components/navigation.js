import React from 'react'

import Script from 'dangerous-html/react'

import './navigation.css'

const Navigation = (props) => {
  return (
    <div className="navigation-container1">
      <div className="navigation-container2">
        <div className="navigation-container3">
          <Script
            html={`<style>
@media (prefers-reduced-motion: reduce) {
.navigation *, .navigation *::before, .navigation *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
}
</style>`}
          ></Script>
        </div>
      </div>
      <nav id="navigation" className="navigation">
        <div className="navigation__container">
          <a href="/" id="navigationLogo">
            <div className="navigation__logo">
              <div className="navigation__logo-icon">
                <svg
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <span className="navigation__logo-text">EventSync</span>
              <div className="navigation__logo-pulse"></div>
            </div>
          </a>
          <div id="navigationLinks" className="navigation__links">
            <a href="#schedule">
              <div className="navigation__link">
                <span className="navigation__link-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 2v4m8-4v4"></path>
                      <rect x="3" y="4" rx="2" width="18" height="18"></rect>
                      <path d="M3 10h18"></path>
                    </g>
                  </svg>
                </span>
                <span className="navigation__link-text">スケジュール</span>
                <span className="navigation__link-glow"></span>
              </div>
            </a>
            <a href="#members">
              <div className="navigation__link">
                <span className="navigation__link-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <circle r="4" cx="9" cy="7"></circle>
                    </g>
                  </svg>
                </span>
                <span className="navigation__link-text">メンバー</span>
                <span className="navigation__link-glow"></span>
              </div>
            </a>
            <a href="/materials">
              <div className="navigation__link">
                <span className="navigation__link-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                      <path d="m3.3 7l8.7 5l8.7-5M12 22V12"></path>
                    </g>
                  </svg>
                </span>
                <span className="navigation__link-text">資材</span>
                <span className="navigation__link-glow"></span>
              </div>
            </a>
          </div>
          <div className="navigation__status">
            <div className="navigation__status-dot"></div>
            <span className="navigation__status-text">LIVE</span>
          </div>
          <button
            id="navigationToggle"
            aria-label="メニューを開く"
            aria-controls="navigationMobile"
            aria-expanded="false"
            className="navigation__toggle"
          >
            <span className="navigation-navigationtoggle-icon1">
              <svg
                width="24"
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 5h16M4 12h16M4 19h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </span>
            <span className="navigation-navigationtoggle-icon2">
              <svg
                width="24"
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </span>
          </button>
        </div>
        <div id="navigationMobile" className="navigation__mobile">
          <div className="navigation__mobile-content">
            <a href="#schedule">
              <div className="navigation__mobile-link">
                <span className="navigation__mobile-link-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 2v4m8-4v4"></path>
                      <rect x="3" y="4" rx="2" width="18" height="18"></rect>
                      <path d="M3 10h18"></path>
                    </g>
                  </svg>
                </span>
                <span className="navigation__mobile-link-text">
                  スケジュール
                </span>
                <span className="navigation__mobile-link-arrow">→</span>
              </div>
            </a>
            <a href="#members">
              <div className="navigation__mobile-link">
                <span className="navigation__mobile-link-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <circle r="4" cx="9" cy="7"></circle>
                    </g>
                  </svg>
                </span>
                <span className="navigation__mobile-link-text">メンバー</span>
                <span className="navigation__mobile-link-arrow">→</span>
              </div>
            </a>
            <a href="/materials">
              <div className="navigation__mobile-link">
                <span className="navigation__mobile-link-icon">
                  <svg
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                      <path d="m3.3 7l8.7 5l8.7-5M12 22V12"></path>
                    </g>
                  </svg>
                </span>
                <span className="navigation__mobile-link-text">資材</span>
                <span className="navigation__mobile-link-arrow">→</span>
              </div>
            </a>
          </div>
        </div>
        <div className="navigation__scanline"></div>
      </nav>
      <div className="navigation-container4">
        <div className="navigation-container5">
          <Script
            html={`<style>
        @keyframes navigation-border-slide {0% {transform: translateX(-100%);}
100% {transform: translateX(100%);}}@keyframes navigation-logo-gradient {0%,100% {background-position: 0% 50%;}
50% {background-position: 100% 50%;}}@keyframes navigation-pulse {0% {transform: translateY(-50%) scale(1);
opacity: 0.3;}
100% {transform: translateY(-50%) scale(1.5);
opacity: 0;}}@keyframes navigation-status-pulse {0%,100% {opacity: 1;
transform: scale(1);}
50% {opacity: 0.6;
transform: scale(1.2);}}@keyframes navigation-scanline {0% {transform: translateY(0);
opacity: 0;}
50% {opacity: 0.3;}
100% {transform: translateY(70px);
opacity: 0;}}
        </style> `}
          ></Script>
        </div>
      </div>
      <div className="navigation-container6">
        <div className="navigation-container7">
          <Script
            html={`<script defer data-name="navigation">
(function(){
  const navigationToggle = document.getElementById("navigationToggle")
  const navigationMobile = document.getElementById("navigationMobile")

  if (navigationToggle && navigationMobile) {
    navigationToggle.addEventListener("click", function () {
      const isExpanded = this.getAttribute("aria-expanded") === "true"

      this.setAttribute("aria-expanded", !isExpanded)
      navigationMobile.classList.toggle("navigation__mobile--active")

      if (!isExpanded) {
        this.setAttribute("aria-label", "メニューを閉じる")
      } else {
        this.setAttribute("aria-label", "メニューを開く")
      }
    })

    // Close mobile menu when clicking on a link
    const mobileLinks = navigationMobile.querySelectorAll(
      ".navigation__mobile-link"
    )
    mobileLinks.forEach((link) => {
      link.addEventListener("click", function () {
        navigationToggle.setAttribute("aria-expanded", "false")
        navigationMobile.classList.remove("navigation__mobile--active")
        navigationToggle.setAttribute("aria-label", "メニューを開く")
      })
    })

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (event) {
      const isClickInsideNav =
        navigationToggle.contains(event.target) ||
        navigationMobile.contains(event.target)
      const isExpanded =
        navigationToggle.getAttribute("aria-expanded") === "true"

      if (!isClickInsideNav && isExpanded) {
        navigationToggle.setAttribute("aria-expanded", "false")
        navigationMobile.classList.remove("navigation__mobile--active")
        navigationToggle.setAttribute("aria-label", "メニューを開く")
      }
    })
  }

  // Active link highlighting based on scroll position
  const sections = document.querySelectorAll("section[id]")
  const navLinks = document.querySelectorAll(
    ".navigation__link, .navigation__mobile-link"
  )

  function highlightActiveLink() {
    const scrollPosition = window.scrollY + 100

    sections.forEach((section) => {
      const sectionTop = section.offsetTop
      const sectionHeight = section.offsetHeight
      const sectionId = section.getAttribute("id")

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        navLinks.forEach((link) => {
          link.style.color = "var(--color-on-surface)"

          if (link.getAttribute("href") === \`#\${sectionId}\`) {
            link.style.color = "var(--color-accent)"
          }
        })
      }
    })
  }

  window.addEventListener("scroll", highlightActiveLink)
  window.addEventListener("load", highlightActiveLink)
})()
</script>`}
          ></Script>
        </div>
      </div>
    </div>
  )
}

export default Navigation
