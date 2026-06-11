import{c as s}from"./createLucideIcon-CwhJ6Frk.js";import{j as e,S as t}from"./app--NV9pfO3.js";import{A as n,a as o,b as r}from"./avatar-CmEHOf2i.js";import{D as p,a as g,b as u,c as y,d as c,f as j,g as d}from"./dropdown-menu-jFx9o6AS.js";import{u as f,f as N,g as k,h as M}from"./sidebar-Ch222VxM.js";import{t as l}from"./stringFormat-Dx_XIxG1.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",key:"3c2336"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],_=s("badge-check",b);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]],w=s("chevrons-up-down",v);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["path",{d:"M18 20a6 6 0 0 0-12 0",key:"1qehca"}],["circle",{cx:"12",cy:"10",r:"4",key:"1h16sb"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],i=s("circle-user-round",A);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]],S=s("log-out",C);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]],O=s("map",D);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],T=s("plus",$);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["path",{d:"M20 7h-9",key:"3s1dr2"}],["path",{d:"M14 17H5",key:"gfn3mx"}],["circle",{cx:"17",cy:"17",r:"3",key:"18b49y"}],["circle",{cx:"7",cy:"7",r:"3",key:"dfmy0x"}]],V=s("settings-2",z);function q({user:a,auth:I}){const{isMobile:m}=f(),x=()=>{sessionStorage.removeItem("cra_year"),console.log("CRA year cleared for cdrrmo_admin"),t.post(route("logout"))},h=()=>{t.get(route("profile.edit"))};return e.jsx(N,{className:"bg-blue-100 rounded-xl",children:e.jsx(k,{children:e.jsxs(p,{children:[e.jsx(g,{asChild:!0,children:e.jsxs(M,{size:"lg",className:"data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",children:[e.jsxs(n,{className:"h-8 w-8 rounded-lg",children:[e.jsx(o,{src:a.role==="cdrrmo_admin"?"/images/cdrrmo.png":a.avatar,alt:a.name}),e.jsx(r,{className:"rounded-lg",children:e.jsx(i,{})})]}),e.jsxs("div",{className:"grid flex-1 text-left text-sm leading-tight",children:[e.jsx("span",{className:"truncate font-semibold",children:a.username}),e.jsx("span",{className:"truncate text-xs",children:l(a.role.replaceAll("_"," "))})]}),e.jsx(w,{className:"ml-auto size-4"})]})}),e.jsxs(u,{className:"w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg",side:m?"bottom":"right",align:"end",sideOffset:4,children:[e.jsx(y,{className:"p-0 font-normal",children:e.jsxs("div",{className:"flex items-center gap-2 px-1 py-1.5 text-left text-sm",children:[e.jsxs(n,{className:"h-8 w-8 rounded-lg",children:[e.jsx(o,{src:a.role==="cdrrmo_admin"?"/images/cdrrmo.png":a.avatar,alt:a.name}),e.jsx(r,{className:"rounded-lg",children:e.jsx(i,{})})]}),e.jsxs("div",{className:"grid flex-1 text-left text-sm leading-tight",children:[e.jsx("span",{className:"truncate font-semibold",children:a.username}),e.jsx("span",{className:"truncate text-xs",children:l(a.role.replaceAll("_"," "))})]})]})}),e.jsx(c,{}),e.jsx(j,{children:e.jsxs(d,{onClick:h,children:[e.jsx(_,{}),"Account Profile"]})}),e.jsx(c,{}),e.jsxs(d,{onClick:x,children:[e.jsx(S,{}),"Log out"]})]})]})})})}export{_ as B,w as C,O as M,q as N,T as P,V as S};
