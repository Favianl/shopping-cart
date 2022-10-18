const d = document;
const $store = d.querySelector('.store__content');
const $cartItems = d.querySelector('.cart__content tbody');
const $cartTotalValue = d.querySelector('.cart__total-value');
const $cartTotalQuantity = d.querySelector('.cart__total-quantity');

const $templateProductStore = d.querySelector('.template__product').content;
const $templateProductCart = d.querySelector('.template__cart-item').content;

import { products } from './products.js';

const cart = {};

//Update the stock quantity of products after a purchase
if (localStorage.getItem('products') !== null) {
  const productsStoraged = JSON.parse(localStorage.getItem('products'));
  for (let id in productsStoraged) {
    products[id].quantity = productsStoraged[id].quantity;
  }
}

// Adding products to the store
const addProductToStore = (template) => {
  for (let id in products) {
    template.querySelector('.product__add-btn').id = id;
    template.querySelector('img').src = products[id].image;

    template.querySelector('.product__name').textContent = products[id].name;

    template.querySelector('.product__description').textContent =
      products[id].description;

    template.querySelector('.product__price').textContent = products[id].price;
    template.querySelector('.product__available').textContent =
      products[id].quantity;

    let clone = template.cloneNode(true);

    if (products[id].quantity < 1) {
      clone.querySelector('.product__stock').style.display = 'none';
      clone.querySelector('.product__sold-out').style.display = 'block';
      clone.querySelector('.product__add-btn').disabled = true;
      clone.querySelector('.product__input').value = 0;
    }

    $store.appendChild(clone);
  }
};

//Notice to show product added message and stock limit message
const notice = (name, quantity, typeOfNotice, toggleClass) => {
  let $notice = d.querySelector(typeOfNotice);
  $notice.children[0].textContent = name;
  $notice.children[1].textContent = quantity;
  $notice.classList.add(toggleClass);
  setTimeout(() => {
    $notice.classList.remove(toggleClass);
  }, 1000);
};

//Increase number of products to add to cart
const increaseQuantityProductStore = (e) => {
  let id = e.target.closest('.product').querySelector('.product__add-btn').id;
  let $productQuantity = e.target.previousElementSibling;
  let quantityInCart = cart.hasOwnProperty(id) ? cart[id].quantity : 0;
  let sumOfQuantities = parseInt($productQuantity.value) + quantityInCart;
  if (
    $productQuantity.value < products[id].quantity &&
    sumOfQuantities < products[id].quantity
  ) {
    $productQuantity.value++;
  } else {
    notice(
      products[id].name,
      products[id].quantity,
      '.notice-limit',
      'show-limit'
    );
  }
};

//Update the sum total of quantities and values depending on the action taken
const updateTotalCart = (target, id, quantity) => {
  if (target.matches('.product__add-btn')) {
    $cartTotalQuantity.textContent =
      parseInt($cartTotalQuantity.textContent) + parseInt(quantity);
    $cartTotalValue.textContent = (
      parseFloat($cartTotalValue.textContent) +
      parseFloat(quantity) * products[id].price
    ).toFixed(2);
  }

  if (target.matches('.cart-item__increase-btn')) {
    $cartTotalQuantity.textContent++;
    $cartTotalValue.textContent = (
      parseFloat($cartTotalValue.textContent) + parseFloat(products[id].price)
    ).toFixed(2);
  }

  if (target.matches('.cart-item__decrease-btn')) {
    $cartTotalQuantity.textContent--;
    $cartTotalValue.textContent = (
      parseFloat($cartTotalValue.textContent) - parseFloat(products[id].price)
    ).toFixed(2);
  }
};

//Fill product data and clone to insert to cart
const addItem = (template, obj, id) => {
  template.querySelector('.cart-item').id = id;
  template.querySelector('img').src = obj[id].image;
  template.querySelector('.cart-item__name').textContent = obj[id].name;
  template.querySelector('.cart-item__input').value = obj[id].quantity;
  template.querySelector('.cart-item__subtotal').textContent = obj[id].value;
  let clone = template.cloneNode(true);
  return clone;
};

//Add or modify product to the cart depending on whether it exists or not
const addToCart = (e) => {
  let id = e.target.id;
  let productQuantityValue =
    e.target.parentElement.querySelector('input').value;

  if (
    !cart.hasOwnProperty(id) &&
    productQuantityValue <= products[id].quantity
  ) {
    cart[id] = {
      name: products[id].name,
      image: products[id].image,
      value: (parseFloat(products[id].price) * productQuantityValue).toFixed(2),
      quantity: parseInt(productQuantityValue),
    };

    $cartItems.appendChild(addItem($templateProductCart, cart, id));

    d.querySelector('.cart__empty').style.display = 'none';
    d.querySelector('.cart__clean-btn').disabled = false;
    d.querySelector('.cart__buy-btn').disabled = false;

    notice(products[id].name, productQuantityValue, '.notice-add', 'show-add');
  } else {
    if (
      parseInt(productQuantityValue) + cart[id].quantity >
      products[id].quantity
    ) {
      return notice(
        products[id].name,
        products[id].quantity,
        '.notice-limit',
        'show-limit'
      );
    }

    cart[id].quantity += parseInt(productQuantityValue);
    $cartItems
      .querySelector(`#${id}`)
      .querySelector('.cart-item__input').value = cart[id].quantity;

    cart[id].value = (
      parseFloat(cart[id].value) +
      parseInt(productQuantityValue) * parseFloat(products[id].price)
    ).toFixed(2);
    $cartItems
      .querySelector(`#${id}`)
      .querySelector('.cart-item__subtotal').textContent = cart[id].value;

    notice(products[id].name, productQuantityValue, '.notice-add', 'show-add');
  }

  e.target.parentElement.querySelector('input').value = 1;
  updateTotalCart(e.target, id, productQuantityValue);
  localStorage.setItem('cart', JSON.stringify(cart));
};

//Increase quantity of product and its value from the cart
const increaseQuantityProductCart = (e) => {
  let id = e.target.parentElement.parentElement.id;
  let $productQuantity = e.target.previousElementSibling;

  if ($productQuantity.value < products[id].quantity) {
    cart[id].quantity++;
    $productQuantity.value++;

    cart[id].value = (
      parseFloat(cart[id].value) + parseFloat(products[id].price)
    ).toFixed(2);
    $cartItems
      .querySelector(`#${id}`)
      .querySelector('.cart-item__subtotal').textContent = cart[id].value;

    updateTotalCart(e.target, id);
  } else {
    notice(
      products[id].name,
      $productQuantity.value,
      '.notice-limit',
      'show-limit'
    );
  }

  localStorage.setItem('cart', JSON.stringify(cart));
};

const decrease = (e) => {
  let $productQuantity = e.target.nextElementSibling;

  //Decrease quantity of the product from the store
  if (
    e.target.matches('.product__decrease-btn') &&
    $productQuantity.value > 1
  ) {
    $productQuantity.value--;
  }

  //Decrease quantity of product and its value from the cart
  if (
    e.target.matches('.cart-item__decrease-btn') &&
    $productQuantity.value > 1
  ) {
    let id = e.target.parentElement.parentElement.id;

    cart[id].quantity--;
    $productQuantity.value--;

    cart[id].value = (
      parseFloat(cart[id].value) - parseFloat(products[id].price)
    ).toFixed(2);
    $cartItems
      .querySelector(`#${id}`)
      .querySelector('.cart-item__subtotal').textContent = cart[id].value;

    updateTotalCart(e.target, id);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
};

//Remove product from cart and update total values
const removeCartItem = (e) => {
  let id = e.target.closest('.cart-item').id;

  $cartTotalValue.textContent = (
    parseFloat($cartTotalValue.textContent) - parseFloat(cart[id].value)
  ).toFixed(2);

  $cartTotalQuantity.textContent =
    parseInt($cartTotalQuantity.textContent) - cart[id].quantity;

  delete cart[id];

  $cartItems.removeChild($cartItems.querySelector(`#${id}`));

  localStorage.setItem('cart', JSON.stringify(cart));

  if ($cartItems.querySelectorAll('.cart-item').length < 1) {
    d.querySelector('.cart__empty').style.display = 'block';
    d.querySelector('.cart__clean-btn').disabled = true;
    d.querySelector('.cart__buy-btn').disabled = true;
    localStorage.removeItem('cart');
  }
};

//Remove all existing products in the cart
const cleanCart = (e) => {
  $cartItems.querySelectorAll('.cart-item').forEach((item) => {
    delete cart[item.id];
    $cartItems.removeChild(item);
  });
  $cartTotalValue.textContent = '0.00';
  $cartTotalQuantity.textContent = 0;
  e.target.disabled = true;
  d.querySelector('.cart__buy-btn').disabled = true;
  d.querySelector('.cart__empty').style.display = 'block';

  localStorage.removeItem('cart');
};

//Process the purchase and update product stock
const purchase = () => {
  d.querySelector('.cart__loader').style.display = 'block';

  d.querySelectorAll('button').forEach((button) => (button.disabled = true));

  setTimeout(() => {
    d.querySelector('.cart__loader').style.display = 'none';

    $cartItems.querySelectorAll('.cart-item').forEach((item) => {
      d.querySelector('.purchase__list').innerHTML += `
            <tr>
              <td>${cart[item.id].name}</td>
              <td>US$ <span>${products[item.id].price}</span></td>
              <td>${cart[item.id].quantity}</td>
              <td>US$ <span>${cart[item.id].value}</span></td>
            </tr>
      `;

      products[item.id].quantity -= cart[item.id].quantity;

      delete cart[item.id];
      $cartItems.removeChild(item);
    });

    d.querySelector('.purchase__total').textContent =
      $cartTotalValue.textContent;

    $cartTotalValue.textContent = '0.00';
    $cartTotalQuantity.textContent = 0;
    d.querySelector('.cart-icon__number').textContent = 0;

    d.querySelector('.cart').style.display = 'none';
    d.querySelector('.purchase').style.display = 'block';
    d.querySelector('.purchase__back-btn').disabled = false;

    localStorage.removeItem('cart');
    localStorage.setItem('products', JSON.stringify(products));
  }, 4000);
};

d.addEventListener('DOMContentLoaded', () => {
  addProductToStore($templateProductStore);

  //Load cart products from localstorage
  if (localStorage.getItem('cart') !== null) {
    let cartStoraged = JSON.parse(localStorage.getItem('cart'));

    for (let id in cartStoraged) {
      cart[id] = {
        name: cartStoraged[id].name,
        image: cartStoraged[id].image,
        value: cartStoraged[id].value,
        quantity: cartStoraged[id].quantity,
      };

      $cartItems.appendChild(addItem($templateProductCart, cartStoraged, id));

      $cartTotalQuantity.textContent =
        parseInt($cartTotalQuantity.textContent) + cartStoraged[id].quantity;

      $cartTotalValue.textContent = (
        parseFloat($cartTotalValue.textContent) +
        parseFloat(cartStoraged[id].value)
      ).toFixed(2);
    }

    d.querySelector('.cart__empty').style.display = 'none';
    d.querySelector('.cart__clean-btn').disabled = false;
    d.querySelector('.cart__buy-btn').disabled = false;
  }

  d.querySelector('.cart-icon__number').textContent =
    $cartTotalQuantity.textContent;
});

d.addEventListener('click', (e) => {
  if (e.target.matches('.product__add-btn')) addToCart(e);
  if (e.target.matches('.product__increase-btn'))
    increaseQuantityProductStore(e);

  if (e.target.matches('.product__decrease-btn')) decrease(e);
  if (e.target.matches('.cart-item__increase-btn'))
    increaseQuantityProductCart(e);

  if (e.target.matches('.cart-item__decrease-btn')) decrease(e);
  if (e.target.matches('.cart-item__remove-btn')) removeCartItem(e);
  if (e.target.matches('.cart__clean-btn')) cleanCart(e);
  if (e.target.matches('.cart__buy-btn')) purchase();
  if (e.target.matches('.cart-icon') || e.target.matches('.cart-icon *')) {
    d.querySelector('.cart').classList.add('show-cart');
  }

  if (e.target.matches('.cart__back-btn') || e.target.matches('.cart')) {
    d.querySelector('.cart').classList.remove('show-cart');
  }

  if (e.target.matches('.purchase__back-btn') || e.target.matches('.purchase'))
    window.location.reload();

  if (e.target.matches('.reset-stock')) {
    localStorage.removeItem('products');
    window.location.reload();
  }

  d.querySelector('.cart-icon__number').textContent =
    $cartTotalQuantity.textContent;
});
