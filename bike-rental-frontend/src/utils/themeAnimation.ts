export function applyThemeAnimation() {

  const id = "theme-transition-style";

  let style = document.getElementById(id) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }

  style.textContent = `
  
  ::view-transition-group(root){
      animation-duration:0.7s;
      animation-timing-function:ease-in-out;
  }

  ::view-transition-new(root){

      animation:themeReveal .7s ease-in-out;

  }

  ::view-transition-old(root){

      animation:none;
      z-index:-1;

  }

  @keyframes themeReveal{

      from{

          clip-path:circle(0% at 50% 50%);

      }

      to{

          clip-path:circle(150% at 50% 50%);

      }

  }

  `;
}