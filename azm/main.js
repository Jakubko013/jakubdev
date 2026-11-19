document.addEventListener('DOMContentLoaded', function () {
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('nav.primary');
  if (!burger || !nav) return;
  var mq = window.matchMedia('(max-width: 980px)');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-active', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    // keep the menu list below the header row, wherever the header currently sits
    nav.style.paddingTop = open ? Math.round(burger.getBoundingClientRect().bottom + 16) + 'px' : '';
    if (!open) {
      nav.querySelectorAll('.nav-item.is-open').forEach(function (o) { o.classList.remove('is-open'); });
    }
  }

  burger.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });

  // Mobile: first tap on an item with a submenu expands it, second tap follows the link
  nav.querySelectorAll('.nav-item').forEach(function (item) {
    var link = item.querySelector('a');
    var dropdown = item.querySelector('.dropdown');
    if (!dropdown || !link) return;
    link.addEventListener('click', function (e) {
      if (mq.matches && !item.classList.contains('is-open')) {
        e.preventDefault();
        nav.querySelectorAll('.nav-item.is-open').forEach(function (o) { o.classList.remove('is-open'); });
        item.classList.add('is-open');
      }
    });
  });

  // Close the menu after choosing a submenu link (needed for same-page anchors)
  nav.querySelectorAll('.dropdown a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  var onChange = function (e) { if (!e.matches) setMenu(false); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
});
