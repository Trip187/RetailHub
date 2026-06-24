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

    $input.val($input.val().trimStart()); // trim leading spaces while typing

    clearTimeout(searchTimeout); // reset timer on each keystroke

    var query = $input.val().trim();

    if (query === "") {
      clearTimeout(searchTimeout);
      return; // don't search if empty
    }

    searchTimeout = setTimeout(function () {
      $form.submit(); // auto-submit after 500ms of no typing
    }, 500);
  });

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  function loadCart() {
    var savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  }

  // Cart stored in memory (resets on page refresh — swap for localStorage if needed)
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
    $("#checkout-cart-data").val(JSON.stringify(cart));
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

    // Flash the badge
    $("#cart-badge").addClass("animate__animated animate__bounceIn");
    setTimeout(function () {
      $("#cart-badge").removeClass("animate__animated animate__bounceIn");
    }, 600);
  }

  $(document).ready(function () {
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
      var productId = $btn.data("product-id"); // ✅ add this

      addToCart(name, price, image, productId); // ✅ pass it

      $btn.text("Added ✓").prop("disabled", true);
      setTimeout(function () {
        $btn.text("Add to Cart").prop("disabled", false);
      }, 1000);
    });
  });
});
