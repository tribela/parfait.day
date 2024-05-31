import '@/entrypoints/public-path';
import ready from 'flavours/glitch/ready';

ready(() => {
  const image = document.querySelector<HTMLImageElement>('img');

  if (!image) return;

  image.addEventListener('mouseenter', () => {
    image.src = '/gyudon.png';
  });

  image.addEventListener('mouseleave', () => {
    image.src = '/spilled_gyudon.png';
  });
}).catch((e: unknown) => {
  console.error(e);
});
