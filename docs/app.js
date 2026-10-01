"use strict";
const projects={
  access:{title:"A.C.C.E.S.S.",type:"COGNITIVE ECOLOGY / PRIVATE DEVELOPMENT",symbol:"Φ",description:"An ecology of persistent AI entities, each with its own memory, values and evolving internal state. The project brings cognition, collective coordination and interaction with a personal Linux environment into one long-term research and engineering programme.",evidence:"Research areas: memory and retrieval, neurochemical state models, decision-making, shared knowledge, cybersecurity and biometrics. The public notebook supplies a separate, reproducible model of isolation, delivery and stability.",tags:["Persistent identity","Individual memory","Cognitive dynamics","Collective coordination"],link:"#notes",label:"Examine the public arguments"},
  sayna:{title:"Sayna",type:"PATIENT EXPERIENCE / PRODUCT",symbol:"S",description:"Make the relationship last beyond the appointment. Sayna brings a clinic-branded patient app together with a management dashboard for aesthetic clinics: loyalty, rewards, bookings, payments and memberships in one product experience.",evidence:"For patients: a familiar place to discover care and return to their clinic. For clinics: a coherent way to manage the relationship, offers and recurring programmes. A patient experience shaped around the identity of each clinic.",tags:["Clinic branding","Patient app","Loyalty & rewards","Memberships"],link:"https://www.sayna.app/",label:"Discover Sayna"},
  maestrale:{title:"Maestrale",type:"MILITARY SIMULATION / LONG-TERM AMBITION",symbol:"M",description:"A military world built around the physical consequences of being there. Maestrale is a long-term FPS project in Unreal Engine, set on a fictional Corsican island, with an ambition that reaches from the body to the terrain.",evidence:"Development ambitions include biomechanical movement, anatomical simulation, ballistics, environmental detail and multiplayer combat. A long-term development programme, from physical foundations to the experience of the world.",tags:["Unreal Engine","Biomechanics","Ballistics","World building"]},
  unicorn:{title:"Unicorn",type:"PROJECT-DRIVEN NETWORKING / IN DEVELOPMENT",symbol:"U",description:"Find the people who want to build what you want to build. Unicorn is a networking product for developers, designers and technical creators: discover collaborators through their skills, interests and projects, then make contact and build together.",evidence:"The product centres on profiles, discovery and matching with understandable explanations. The product is in development for a public launch.",tags:["Find collaborators","Project discovery","Explainable matches","Build together"]},
  desktop:{title:"Tokonoma",type:"PERSONAL WORKSPACE / VISUAL LANGUAGE",symbol:"開",description:"The alcove around the work. A personal interface language for Kairo: architectural composition, dark ink, dusty rose and small objects placed with intention. Quiet enough to live in; expressive enough to feel like mine.",evidence:"The layered sculpture on this page is an original interactive visual composition. It expresses the atmosphere of the collection rather than depicting an internal system architecture.",tags:["Spatial composition","Ink & rose","Personal interfaces","Interactive identity"]},
  residence:{title:"The residence",type:"SPATIAL DESKTOP / UNDER CONSTRUCTION",symbol:"⌂",description:"A desktop you can inhabit. The residence explores an interactive 3D interface on Arch Linux: navigable spaces, entities with a visual presence, and applications approached as parts of a place.",evidence:"Under construction: a usable spatial environment integrated with the desktop, bringing rooms, objects and embodied interfaces into everyday interaction.",tags:["Arch Linux","Spatial interaction","Embodied interfaces","Rooms & objects"]}
};
function renderTags(project){const container=document.getElementById("project-tags");container.replaceChildren(...project.tags.map(label=>{const span=document.createElement("span");span.textContent=label;return span;}));}
renderTags(projects.access);
document.querySelectorAll(".project").forEach(button=>button.addEventListener("click",()=>{
  const project=projects[button.dataset.project];
  document.querySelectorAll(".project").forEach(item=>{const selected=item===button;item.classList.toggle("selected",selected);item.setAttribute("aria-pressed",String(selected));});
  for(const [id,key] of [["project-title","title"],["project-type","type"],["project-description","description"],["project-evidence","evidence"]])document.getElementById(id).textContent=project[key];
  document.querySelector(".detail-emblem").textContent=project.symbol;
  renderTags(project);document.getElementById("project-detail").dataset.project=button.dataset.project;
  const link=document.getElementById("project-link");link.hidden=!project.link;
  if(project.link){link.href=project.link;link.textContent=project.label+" ↗";}else link.removeAttribute("href");
}));
const flow=createFlowField();
const scene=document.getElementById("scene"),sculpture=document.getElementById("sculpture"),motion=document.getElementById("motion"),reduced=matchMedia("(prefers-reduced-motion: reduce)");
let paused=reduced.matches,frame=0;
function reset(){if(frame)cancelAnimationFrame(frame);frame=0;sculpture.style.setProperty("--rx","0deg");sculpture.style.setProperty("--ry","0deg");}
function sync(){flow.setPaused(paused||reduced.matches);document.body.dataset.motion=paused?"off":"on";motion.setAttribute("aria-pressed",String(paused));motion.textContent=paused?"Resume motion":"Pause motion";document.getElementById("scene-hint").textContent=paused?"SCULPTURAL IDENTITY / STILL VIEW":"MOVE TO CHANGE PERSPECTIVE";if(paused)reset();}
motion.addEventListener("click",()=>{paused=!paused;sync();});reduced.addEventListener("change",()=>{paused=reduced.matches;sync();});sync();
scene.addEventListener("pointermove",event=>{if(paused||reduced.matches||event.pointerType==="touch"||frame)return;const rect=scene.getBoundingClientRect();const x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));const y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));frame=requestAnimationFrame(()=>{sculpture.style.setProperty("--rx",(-y*9).toFixed(2)+"deg");sculpture.style.setProperty("--ry",(x*13).toFixed(2)+"deg");frame=0;});});scene.addEventListener("pointerleave",reset);
document.getElementById("expand").addEventListener("click",event=>{const expanded=sculpture.classList.toggle("expanded");event.currentTarget.setAttribute("aria-pressed",String(expanded));event.currentTarget.textContent=expanded?"Reassemble layers ↙":"Separate layers ↗";});


/** Seeded floral contours, a damped spring, and a local pointer light. */
function createFlowField(){
  const canvas=document.getElementById("flow-field"),context=canvas.getContext("2d");
  if(!context)return {setPaused(){}};
  const MAX_FORMS=18,MAX_CONTOURS=4,MAX_STEPS=80,MAX_DPR=1.5,MAX_PIXELS=3600000;
  const SPRING=155,DAMPING=17,MAX_SETTLE_MS=2400;
  let width=1,height=1,frame=0,paused=false,last=0,deadline=0,activity=0,targetActivity=0;
  let x=0,y=0,targetX=0,targetY=0,vx=0,vy=0,forms=[];
  function seeded(seed){let state=seed;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
  function draw(){
    context.clearRect(0,0,width,height);
    const radius=Math.min(340,Math.max(210,width*.3)),radiusSquared=radius*radius;
    const stretchX=Math.max(-26,Math.min(26,vx*.028));
    const stretchY=Math.max(-26,Math.min(26,vy*.028));
    for(const form of forms){
      for(let contour=0;contour<MAX_CONTOURS;contour++){
        context.beginPath();
        for(let step=0;step<=MAX_STEPS;step++){
          const angle=step/MAX_STEPS*Math.PI*2;
          const petal=1+Math.cos(angle*form.petals+form.phase)*.23+Math.sin(angle*3-form.phase)*.09;
          const r=form.radius*petal*(.64+contour*.15);
          const px=form.x+Math.cos(angle+form.rotation)*r;
          const py=form.y+Math.sin(angle+form.rotation)*r*form.aspect;
          const dx=px-x,dy=py-y,influence=Math.exp(-(dx*dx+dy*dy)/radiusSquared)*activity;
          const pullX=-dx*influence*.16+stretchX*influence;
          const pullY=-dy*influence*.16+stretchY*influence;
          if(step===0)context.moveTo(px+pullX,py+pullY);else context.lineTo(px+pullX,py+pullY);
        }
        context.closePath();
        context.strokeStyle=contour===1?"rgba(211,160,181,.76)":"rgba(154,163,184,.46)";
        context.lineWidth=contour===1?.9:.65;context.stroke();
      }
    }
    // Reveal only the neighbourhood of the actual pointer; distant forms fade out.
    const light=context.createRadialGradient(targetX,targetY,0,targetX,targetY,radius);
    light.addColorStop(0,"rgba(0,0,0,"+(.58*activity+.012)+")");
    light.addColorStop(.4,"rgba(0,0,0,"+(.3*activity+.012)+")");
    light.addColorStop(1,"rgba(0,0,0,.006)");
    context.globalCompositeOperation="destination-in";context.fillStyle=light;
    context.fillRect(0,0,width,height);context.globalCompositeOperation="source-over";
  }
  function tick(time){
    frame=0;if(paused||document.hidden)return;
    const elapsed=Math.min(32,last?time-last:16);last=time;
    // Small fixed substeps keep the spring stable after a delayed browser frame.
    const steps=Math.ceil(elapsed/8),dt=elapsed/steps/1000;
    for(let step=0;step<steps;step++){
      vx+=((targetX-x)*SPRING-vx*DAMPING)*dt;vy+=((targetY-y)*SPRING-vy*DAMPING)*dt;
      x+=vx*dt;y+=vy*dt;
    }
    activity+=(targetActivity-activity)*(1-Math.exp(-elapsed/90));draw();
    const unsettled=Math.abs(targetX-x)+Math.abs(targetY-y)>.2||Math.abs(vx)+Math.abs(vy)>.8||Math.abs(targetActivity-activity)>.002;
    if(unsettled&&time<deadline)frame=requestAnimationFrame(tick);
    else {last=0;vx=vy=0;x=targetX;y=targetY;activity=targetActivity;draw();}
  }
  function request(){if(!frame&&!paused&&!document.hidden)frame=requestAnimationFrame(tick);}
  function resize(){
    width=innerWidth;height=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,MAX_DPR,Math.sqrt(MAX_PIXELS/(width*height)));
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    context.setTransform(dpr,0,0,dpr,0,0);
    const random=seeded(29031),columns=width<700?3:6,rows=3;
    forms=Array.from({length:Math.min(MAX_FORMS,columns*rows)},(_,index)=>({
      x:((index%columns+.5+(random()-.5)*.65)/columns)*width,
      y:((Math.floor(index/columns)+.5+(random()-.5)*.6)/rows)*height,
      radius:Math.min(width/columns,height/rows)*(.38+random()*.3),
      petals:3+Math.floor(random()*4),phase:random()*Math.PI*2,
      rotation:random()*Math.PI*2,aspect:.62+random()*.5
    }));
    x=targetX=width*.65;y=targetY=height*.45;vx=vy=0;draw();
  }
  window.addEventListener("pointermove",event=>{if(paused||event.pointerType==="touch")return;targetX=event.clientX;targetY=event.clientY;targetActivity=1;deadline=performance.now()+MAX_SETTLE_MS;request();},{passive:true});
  document.documentElement.addEventListener("pointerleave",()=>{targetActivity=0;deadline=performance.now()+MAX_SETTLE_MS;request();},{passive:true});
  window.addEventListener("resize",resize,{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;last=0;}else {deadline=performance.now()+MAX_SETTLE_MS;request();}});
  window.addEventListener("pagehide",()=>{if(frame)cancelAnimationFrame(frame);frame=0;},{once:true});
  resize();
  return {setPaused(value){paused=value;if(paused){if(frame)cancelAnimationFrame(frame);frame=0;last=0;vx=vy=0;activity=targetActivity=0;draw();}else{deadline=performance.now()+MAX_SETTLE_MS;request();}}};
}
