import 'packs/public-path';
import ready from 'flavours/glitch/ready';

ready(() => {
  const image = document.querySelector('img');

  image.addEventListener('mouseenter', () => {
    image.src = '/gyudon.png';
  });

  image.addEventListener('mouseleave', () => {
    image.src = '/spilled_gyudon.png';
  });
});
