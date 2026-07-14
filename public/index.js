$(document).ready(function () {
  $("#items").addClass("items");
  $(".card-subtitle, .card-text")
    .on("mouseenter", function () {
      $(this).removeClass("underline-in").addClass("underline-out");
    })
    .on("mouseleave", function () {
      $(this).removeClass("underline-out").addClass("underline-in");
      var el = $(this);
      setTimeout(function () {
        el.removeClass("underline-in");
      }, 400);
    });

  var searchTimeout;

  $('input[type="search"]').on("keyup input", function () {
    var $input = $(this);
    var $form = $input.closest("form");

    $input.val($input.val().trimStart());

    clearTimeout(searchTimeout);

    var query = $input.val().trim();

    if (query === "") {
      clearTimeout(searchTimeout);
      return;
    }

    searchTimeout = setTimeout(function () {
      $form.submit();
    }, 500);
  });

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  function loadCart() {
    var savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  }

  var cart = loadCart();

  function updateBadge() {
    var total = cart.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
    if (total > 0) {
      $("#cart-badge").text(total).show();
    } else {
      $("#cart-badge").hide();
    }
  }

  function updateCartPanel() {
    var $list = $("#cart-items-list");
    var $footer = $("#cart-footer");

    if (cart.length === 0) {
      $list.html(
        '<p class="text-muted text-center mt-4">Your cart is empty.</p>',
      );
      $footer.hide();
      return;
    }

    var html = "";
    var grandTotal = 0;

    cart.forEach(function (item, index) {
      var lineTotal = item.price * item.qty;
      grandTotal += lineTotal;
      html += `
      <div class="d-flex gap-3 align-items-start border-bottom py-3">
       <img src="${item.image.startsWith("/") ? item.image : "/images/" + item.image}" 
      style="width:64px; height:64px; object-fit:cover; border-radius:8px; flex-shrink:0;"
      onerror="this.onerror=null; this.src='/images/default.png'">
        <div class="flex-grow-1">
          <p class="mb-1 fw-500" style="font-size:14px;">${item.name}</p>
          <p class="mb-2 text-muted" style="font-size:13px;">KSh ${item.price.toFixed(2)}</p>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-secondary btn-sm qty-btn" 
              data-index="${index}" data-delta="-1" style="width:28px; height:28px; padding:0;">−</button>
            <span class="qty-display" style="min-width:20px; text-align:center;">${item.qty}</span>
            <button class="btn btn-outline-secondary btn-sm qty-btn" 
              data-index="${index}" data-delta="1" style="width:28px; height:28px; padding:0;">+</button>
          </div>
        </div>
        <div class="text-end">
          <p style="font-size:14px; font-weight:500;">KSh ${lineTotal.toFixed(2)}</p>
          <button class="btn btn-link text-danger p-0 remove-btn" 
            data-index="${index}" style="font-size:12px;">Remove</button>
        </div>
      </div>`;
    });

    $list.html(html);
    $("#cart-total").text("KSh " + grandTotal.toFixed(2));
    $footer.show();
  }

  // Add to cart — called from product cards
  function addToCart(name, price, image, productId) {
    var existing = cart.find(function (i) {
      return i.name === name;
    });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        name: name,
        price: parseFloat(price),
        image: image,
        qty: 1,
        productId: productId,
      });
    }
    saveCart();
    updateBadge();
    updateCartPanel();

    $("#cart-badge").addClass("animate__animated animate__bounceIn");
    setTimeout(function () {
      $("#cart-badge").removeClass("animate__animated animate__bounceIn");
    }, 600);
  }

  // M-Pesa pay button
  $(document).on("click", "#pay-btn", function () {
    var phone = $("#mpesa-phone").val().trim();

    if (!phone) {
      $("#pay-status")
        .text("Please enter your M-Pesa phone number.")
        .css("color", "red");
      return;
    }

    var grandTotal = cart.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);

    $("#pay-btn").text("Processing...").prop("disabled", true);
    $("#pay-status")
      .text("Check your phone for the M-Pesa prompt.")
      .css("color", "#6d28d9");

    fetch("/mpesa/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone,
        amount: grandTotal,
        cartData: cart,
      }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.success) {
          $("#pay-status")
            .text("Payment prompt sent! Complete on your phone.")
            .css("color", "green");
          cart = [];
          saveCart();
          updateBadge();
          updateCartPanel();
        } else {
          $("#pay-status")
            .text("Payment failed. Try again.")
            .css("color", "red");
          $("#pay-btn").text("Pay with M-Pesa").prop("disabled", false);
        }
      })
      .catch(function () {
        $("#pay-status").text("Network error. Try again.").css("color", "red");
        $("#pay-btn").text("Pay with M-Pesa").prop("disabled", false);
      });
  });

  // Qty +/- buttons inside offcanvas
  $(document).on("click", ".qty-btn", function () {
    var index = $(this).data("index");
    var delta = $(this).data("delta");
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveCart();
    updateBadge();
    updateCartPanel();
  });

  // Remove button
  $(document).on("click", ".remove-btn", function () {
    var index = $(this).data("index");
    cart.splice(index, 1);
    saveCart();
    updateBadge();
    updateCartPanel();
  });

  // Add to cart buttons on product cards
  $(document).on("click", ".add-to-cart-btn", function () {
    var $btn = $(this);
    var name = $btn.data("name");
    var price = $btn.data("price");
    var image = $btn.data("image");
    var productId = $btn.data("product-id");

    addToCart(name, price, image, productId);

    $btn.text("Added ✓").prop("disabled", true);
    setTimeout(function () {
      $btn.text("Add to Cart").prop("disabled", false);
    }, 1000);
  });

  // Init on load
  updateBadge();
  updateCartPanel();
});

// aboutUs.js
$(function () {
  // ---- About Us section ----
  let aboutAnimated = false;
  function animateAboutUs() {
    $(".aboutUs h1").addClass("in");

    // fixed: was $(".nav").fadeIn("slow") — fadeIn can't override
    // visibility:hidden, and there was no .nav.visible CSS rule.
    // Toggling a class lets the CSS transition handle it instead.
    $(".nav").addClass("visible");

    setTimeout(function () {
      $(".aboutUs .about-img").addClass("in");
    }, 0);
    setTimeout(function () {
      $(".aboutUs .about-text").addClass("in");
    }, 1000);
  }

  // ---- Product categories section (slideshow, starts once in view) ----
  let categoriesStarted = false;
  function startCategorySlideshow() {
    const $categories = $(".product-category");
    let current = 0;
    const slideDuration = 3000; // 3 seconds per slide

    function showSlide(index) {
      $categories.removeClass("active");
      $categories.eq(index).addClass("active");
    }

    showSlide(current); // show the first slide immediately

    setInterval(function () {
      current = (current + 1) % $categories.length;
      showSlide(current);
    }, slideDuration);
  }

  // ---- Shared scroll listener ----
  $(window)
    .on("scroll", function () {
      const scrollY = $(window).scrollTop() + $(window).height();

      if (!aboutAnimated) {
        const $about = $(".aboutUs");
        if ($about.length && scrollY > $about.offset().top) {
          aboutAnimated = true;
          animateAboutUs();
        }
      }

      if (!categoriesStarted) {
        const $categories = $(".product-categories");
        if ($categories.length && scrollY > $categories.offset().top + 100) {
          categoriesStarted = true;
          startCategorySlideshow();
        }
      }
    })
    .trigger("scroll");
});
