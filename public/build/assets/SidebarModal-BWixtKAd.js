import{j as e}from"./app--NV9pfO3.js";import{X as i}from"./x-CuGhfGws.js";import"./createLucideIcon-CwhJ6Frk.js";function x({isOpen:t,onClose:l,title:r="Details",icon:s=null,children:a}){return t?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]",onClick:l}),e.jsxs("div",{className:`
                    fixed top-0 right-0 h-full z-[9999]
                    bg-white/90 backdrop-blur-md
                    shadow-[0_8px_30px_rgba(107,114,128,0.4)]
                    border border-gray-200 rounded-l-lg
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    w-full                     /* Default: Full width on smallest screens (mobile) */
                    sm:w-[400px]               /* Sm: Width of 400px */
                    md:w-[600px]               /* Md: Width of 600px */
                    lg:w-[800px]               /* Lg: Width of 800px */

                    /* Transition state */
                    ${t?"translate-x-0":"translate-x-full"}
                `,children:[e.jsxs("div",{className:`flex items-center justify-between px-4 sm:px-6 py-4
                               bg-gradient-to-r from-blue-600 to-blue-500
                               border-b border-white/20 rounded-tl-lg shadow-md`,children:[e.jsxs("div",{className:"flex items-center gap-2",children:[s&&e.jsx("span",{className:"text-white text-xl",children:s}),e.jsx("h2",{className:"text-base sm:text-lg font-semibold text-white",children:r})]}),e.jsx("button",{onClick:l,className:`w-8 h-8 flex items-center justify-center
                                   rounded-full bg-white/20 text-white text-lg
                                   hover:bg-red-500/80 hover:scale-105
                                   transition-all duration-200 ease-in-out`,"aria-label":"Close details sidebar",children:e.jsx(i,{size:18})})]}),e.jsx("div",{className:"p-4 sm:p-6 text-sm text-gray-800 overflow-y-auto h-full",children:a})]})]}):null}export{x as default};
