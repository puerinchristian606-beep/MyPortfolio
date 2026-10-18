// Portfolio scripts: mobile menu, active-section nav, profile display, and page interactions.
(function () {
    // ---------- Mobile menu ----------
    var toggle = document.getElementById("menu-toggle");
    var nav = document.getElementById("nav");
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        });
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("nav-open");
                toggle.setAttribute("aria-expanded", "false");
                toggle.setAttribute("aria-label", "Open menu");
            });
        });
    }

    // ---------- Highlight the nav link for the section on screen ----------
    var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']")) : [];
    var sections = navLinks.map(function (link) {
        return document.getElementById(link.getAttribute("href").slice(1));
    }).filter(Boolean);

    function setActive(id) {
        navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + id);
        });
    }

    function updateActive() {
        var line = window.innerHeight * 0.35;
        var current = sections[0];
        sections.forEach(function (sec) {
            if (sec.getBoundingClientRect().top <= line) current = sec;
        });
        // At the very bottom, the last section (Contact) is short, so force it active
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = sections[sections.length - 1];
        }
        if (current) setActive(current.id);
    }

    if (sections.length) {
        window.addEventListener("scroll", updateActive, { passive: true });
        window.addEventListener("resize", updateActive);
        updateActive();
    }

    // ---------- Show profile on the page ----------
    // Content comes from js/profile.js. Edit that file to change your details.
    function phoneHref(phone) {
        return "tel:" + String(phone).replace(/[^\d+]/g, "");
    }

    function applyProfile(profile) {
        document.querySelectorAll("[data-profile]").forEach(function (el) {
            var key = el.getAttribute("data-profile");
            if (key === "interests") {
                el.textContent = "";
                (profile.interests || []).forEach(function (item) {
                    var li = document.createElement("li");
                    li.textContent = item;
                    el.appendChild(li);
                });
            } else if (key === "nameBig") {
                var first = String(profile.name || "").trim().split(/\s+/)[0];
                if (first) el.textContent = "Hi, I'm " + first;
            } else if (key === "email") {
                el.textContent = profile.email;
                el.href = "mailto:" + profile.email + "?subject=Hello%20from%20your%20portfolio";
            } else if (key === "emailButton") {
                if (!profile.email || /example\.com$/i.test(profile.email)) { el.hidden = true; return; }
                el.href = "mailto:" + profile.email + "?subject=Hello%20from%20your%20portfolio";
            } else if (key === "facebook") {
                el.href = profile.facebook;
            } else if (key === "phoneLink") {
                el.href = phoneHref(profile.phone);
            } else if (key === "phone") {
                el.textContent = profile.phone;
                el.href = phoneHref(profile.phone);
            } else {
                el.textContent = profile[key] || "";
            }
        });
    }

    if (window.PROFILE) applyProfile(window.PROFILE);

    // ---------- Interactions ----------
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var header = document.getElementById("header");

    // Scroll progress bar under the header
    if (header) {
        var bar = document.createElement("div");
        bar.className = "progress";
        header.appendChild(bar);
        var updateBar = function () {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
        };
        window.addEventListener("scroll", updateBar, { passive: true });
        window.addEventListener("resize", updateBar);
        updateBar();
    }

    // Sliding pill behind the active nav link (desktop)
    if (nav && navLinks.length) {
        var pill = document.createElement("span");
        pill.className = "nav-pill";
        pill.setAttribute("aria-hidden", "true");
        nav.insertBefore(pill, nav.firstChild);
        var placed = false;
        var movePill = function () {
            var active = nav.querySelector("a.active");
            if (!active || !active.offsetWidth) return;
            pill.style.width = active.offsetWidth + "px";
            pill.style.height = active.offsetHeight + "px";
            pill.style.transform = "translate(" + active.parentNode.offsetLeft + "px," + active.parentNode.offsetTop + "px)";
            if (!placed) {
                placed = true;
                requestAnimationFrame(function () { pill.classList.add("ready"); });
            }
        };
        new MutationObserver(movePill).observe(nav, { attributes: true, subtree: true, attributeFilter: ["class"] });
        window.addEventListener("resize", movePill);
        window.addEventListener("load", movePill);
        movePill();
    }

    // Project filter tabs
    var tabs = document.querySelectorAll(".tab");
    var projects = document.querySelectorAll(".project[data-cat]");
    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            var filter = tab.getAttribute("data-filter");
            tabs.forEach(function (t) { t.classList.toggle("active", t === tab); });
            projects.forEach(function (p) {
                p.hidden = !(filter === "all" || p.getAttribute("data-cat") === filter);
            });
        });
    });

    if (!reduceMotion) {
        // Scroll reveal (content stays visible if this script fails)
        document.documentElement.classList.add("js-motion");
        var list = Array.prototype.slice.call(document.querySelectorAll(
            "main > section:not(.hero) .section-title, main > section:not(.hero) .section-intro, " +
            ".about-text, .skill, .tabs, .project, .contact-card"));
        list.forEach(function (el, i) {
            el.classList.add("reveal");
            el.style.setProperty("--d", (i % 3) * 0.08 + "s");
        });
        if ("IntersectionObserver" in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in");
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
            list.forEach(function (el) { io.observe(el); });
        } else {
            list.forEach(function (el) { el.classList.add("in"); });
        }
    }

    if (canHover && !reduceMotion) {
        // Soft light that follows the mouse
        var root = document.documentElement;
        window.addEventListener("mousemove", function (e) {
            root.style.setProperty("--mx", e.clientX + "px");
            root.style.setProperty("--my", e.clientY + "px");
            root.classList.add("has-glow");
        }, { passive: true });
    }

    // ---------- Photo that travels from Home down to About ----------
    var heroVisual = document.querySelector(".hero-visual");
    var aboutPhoto = document.querySelector(".about-photo");
    if (heroVisual && aboutPhoto && !reduceMotion) {
        var travel = document.createElement("div");
        travel.className = "travel";
        travel.setAttribute("aria-hidden", "true");
        var tPhoto = heroVisual.querySelector(".hero-photo").cloneNode(true);
        travel.appendChild(tPhoto);
        heroVisual.querySelectorAll(".float").forEach(function (f) { travel.appendChild(f.cloneNode(true)); });
        document.body.appendChild(travel);

        var H = null, A = null, enabled = false, ticking = false;
        var root2 = document.documentElement;

        function docRect(el) {
            var r = el.getBoundingClientRect();
            return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width };
        }

        function measure() {
            enabled = window.innerWidth > 900;
            root2.classList.toggle("travel-on", enabled);
            if (!enabled) return;
            // measure the real elements (they are only hidden, so layout is unchanged)
            root2.classList.remove("travel-on");
            H = docRect(heroVisual);
            A = docRect(aboutPhoto);
            root2.classList.add("travel-on");
            place();
        }

        function place() {
            if (!enabled || !H || !A) return;
            var docY = Math.min(window.scrollY + H.y, A.y);
            var t = A.y > H.y ? Math.max(0, Math.min(1, (docY - H.y) / (A.y - H.y))) : 1;
            var x = H.x + (A.x - H.x) * t;
            var w = H.w + (A.w - H.w) * t;
            travel.style.width = w + "px";
            travel.style.height = w + "px";
            travel.style.transform = "translate(" + x + "px," + docY + "px)";
            travel.style.setProperty("--t", t);
        }

        window.addEventListener("scroll", function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () { ticking = false; place(); });
        }, { passive: true });
        window.addEventListener("resize", measure);
        window.addEventListener("load", measure);
        if ("ResizeObserver" in window) {
            var ro = new ResizeObserver(measure);
            ro.observe(document.querySelector("main"));
        }
        measure();

        // Tilt toward the pointer
        if (canHover) {
            tPhoto.addEventListener("mousemove", function (e) {
                var r = tPhoto.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width - 0.5;
                var y = (e.clientY - r.top) / r.height - 0.5;
                tPhoto.style.transform = "perspective(900px) rotateY(" + (x * 10) + "deg) rotateX(" + (-y * 10) + "deg)";
            });
            tPhoto.addEventListener("mouseleave", function () { tPhoto.style.transform = ""; });
        }
    }
})();
