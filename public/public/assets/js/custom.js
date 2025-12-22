(function ($) {
  "use strict";

  $(window).scroll(function () {
    var scroll = $(window).scrollTop();
    var box = $(".header-text").height();
    var header = $("header").height();

    if (scroll >= box - header) {
      $("header").addClass("background-header");
    } else {
      $("header").removeClass("background-header");
    }
  });

  $(".input-group.date").datepicker({ format: "dd.mm.yyyy" });

  $(".filters ul li").click(function () {
    $(".filters ul li").removeClass("active");
    $(this).addClass("active");

    var data = $(this).attr("data-filter");
    $grid.isotope({
      filter: data,
    });
  });

  var $grid = $(".grid").isotope({
    itemSelector: ".all",
    percentPosition: true,
    masonry: {
      columnWidth: ".all",
    },
  });

  // Slider initialization moved to React Banner component
  // to handle dynamic image loading from API

  $(".search-icon a").on("click", function (event) {
    event.preventDefault();
    $("#search").addClass("open");
    $('#search > form > input[type="search"]').focus();
  });

  $("#search, #search button.close").on("click keyup", function (event) {
    if (
      event.target == this ||
      event.target.className == "close" ||
      event.keyCode == 27
    ) {
      $(this).removeClass("open");
    }
  });

  $("#search-box").submit(function (event) {
    event.preventDefault();
    return false;
  });

  $(function () {
    $("#tabs").tabs();
  });

  // Owl Carousel initialization moved to React Menu component
  // to handle dynamic menu items loading from API

  // Window Resize Mobile Menu Fix
  mobileNav();

  // Scroll animation init
  window.sr = new scrollReveal();

  // Menu Dropdown Toggle
  if ($(".menu-trigger").length) {
    $(".menu-trigger").on("click", function () {
      $(this).toggleClass("active");
      $(".header-area .nav").slideToggle(200);
    });
  }

  // Menu elevator animation
  $(".scroll-to-section a[href*=\\#]:not([href=\\#])").on("click", function () {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      var target = $(this.hash);
      target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
      if (target.length) {
        var width = $(window).width();
        if (width < 991) {
          $(".menu-trigger").removeClass("active");
          $(".header-area .nav").slideUp(200);
        }
        $("html,body").animate(
          {
            scrollTop: target.offset().top - 80,
          },
          700
        );
        return false;
      }
    }
  });

  $(document).ready(function () {
    $(document).on("scroll", onScroll);

    //smoothscroll
    $('.scroll-to-section a[href^="#"]').on("click", function (e) {
      e.preventDefault();

      // Skip if hash is empty or just "#"
      if (!this.hash || this.hash === "#") {
        return;
      }

      $(document).off("scroll");

      $(".scroll-to-section a").each(function () {
        $(this).removeClass("active");
      });
      $(this).addClass("active");

      var target = this.hash,
        menu = target;
      var target = $(this.hash);

      // Check if target exists
      if (target.length === 0) {
        $(document).on("scroll", onScroll);
        return;
      }

      $("html, body")
        .stop()
        .animate(
          {
            scrollTop: target.offset().top - 79,
          },
          500,
          "swing",
          function () {
            window.location.hash = target;
            $(document).on("scroll", onScroll);
          }
        );
    });
  });

  function onScroll(event) {
    var scrollPos = $(document).scrollTop();
    $(".nav a").each(function () {
      var currLink = $(this);
      var href = currLink.attr("href");
      // Skip if href is not a valid selector (e.g., "#" or "javascript:;")
      if (
        !href ||
        href === "#" ||
        href.indexOf("javascript:") === 0 ||
        href.indexOf("#") !== 0
      ) {
        return;
      }
      try {
        var refElement = $(href);
        if (
          refElement.length &&
          refElement.position().top <= scrollPos &&
          refElement.position().top + refElement.height() > scrollPos
        ) {
          $(".nav ul li a").removeClass("active");
          currLink.addClass("active");
        } else {
          currLink.removeClass("active");
        }
      } catch (e) {
        // Ignore invalid selectors
      }
    });
  }

  // Page loading animation
  $(window).on("load", function () {
    if ($(".cover").length) {
      $(".cover").parallax({
        imageSrc: $(".cover").data("image"),
        zIndex: "1",
      });
    }

    $("#preloader").animate(
      {
        opacity: "0",
      },
      600,
      function () {
        setTimeout(function () {
          $("#preloader").css("visibility", "hidden").fadeOut();
        }, 300);
      }
    );
  });

  // Window Resize Mobile Menu Fix
  $(window).on("resize", function () {
    mobileNav();
  });

  // Window Resize Mobile Menu Fix
  function mobileNav() {
    var width = $(window).width();
    $(".submenu").on("click", function () {
      if (width < 767) {
        $(".submenu ul").removeClass("active");
        $(this).find("ul").toggleClass("active");
      }
    });
  }
})(window.jQuery);
