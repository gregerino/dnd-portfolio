function openLightbox(src, alt) {
  var overlay = document.getElementById('lightbox');
  var img = document.getElementById('lightbox-img');
  img.src = src;
  img.alt = alt || '';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  var overlay = document.getElementById('lightbox');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
});
