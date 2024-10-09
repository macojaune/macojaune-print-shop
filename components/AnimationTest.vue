<template>
    <div>
        <div ref="main" class="grid grid-cols-3 gap-[5vh]">
            <div 
            v-for="i in images" 
            :key="i" 
            class="h-[100svh] bg-cover bg-position-center grid__item" 
            :style="`background-image:url(${i.src})`" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger); 
const main = ref()
let ctx: gsap.GSAPContext;

const images = ref(Array(15).fill(0).map((_, i) => ({
    src: `https://picsum.photos/1200?random=${i}`,
})))

onMounted(() => {
    ctx = gsap.context((self) => {
        const imgList = self.selector(".grid__item");
        
        let ft, st: gsap.core.Timeline;
        console.log(imgList)
        imgList.forEach((img, index) => {
            if (index < 3) {
              
                gsap.set(img, { transformOrigin: `0% 100%` });
                gsap.to(img, {
                    ease: "none",
                    startAt: { scale: 1 },
                    scale: 0,
                    scrollTrigger: {
                        trigger: img,
                        start: "center center",
                        end: "bottom top",
                        scrub: true,
                        fastScrollEnd: true,
                        onLeave: () => {
                            gsap.set(img, { scale: 1 });
                        },
                    },
                });
            } else if (index > 2 && index < imgList.length - 3) {

                gsap.set(img, { transformOrigin: `100% 0%`, scale: 0 });
                gsap.to(img, {
                    ease: "none",
                    startAt: { scale: 0 },
                    scale: 1,
                    scrollTrigger: {
                        trigger: img,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                        fastScrollEnd: true,
                        onLeaveBack: () => {
                            gsap.set(img, { scale: 1 });
                        },
                    },
                });
            } else {
                ft = gsap.timeline().to(img, {
                    scrollTrigger: {
                        trigger: img,
                        start: "top bottom",
                        end: "center center",
                        scrub: true,
                        onEnter: () => gsap.set(img, { transformOrigin: `100% 0%` }),
                        onEnterBack: () => gsap.set(img, { transformOrigin: `100% 0%` }),
                        onLeave: () => gsap.set(img, { transformOrigin: `0% 100%` }),
                        onLeaveBack: () => gsap.set(img, { transformOrigin: `0% 100%` }),
                    },
                    onStart: () => {
                        if (st) st.kill();
                    },
                    startAt: { scale: 0 },
                    scale: 1,
                    ease: "none",
                });

                st = gsap.timeline().to(img, {
                    scrollTrigger: {
                      
                        trigger: img,
                        start: "center center",
                        end: "bottom top",
                        scrub: true,
                        onEnter: () => gsap.set(img, { transformOrigin: `0% 100%` }),
                        onEnterBack: () => gsap.set(img, { transformOrigin: `0% 100%` }),
                        onLeave: () => gsap.set(img, { transformOrigin: `100% 0%` }),
                        onLeaveBack: () => gsap.set(img, { transformOrigin: `100% 0%` }),
                    },
                    onStart: () => {
                        if (ft) ft.kill();
                    },
                    startAt: { scale: 1 },
                    scale: 0,
                    ease: "none",
                });
            }
        });
    }, main.value) // <- Scope!

    window.addEventListener("resize", refresh)
    window.addEventListener("scroll",ScrollTrigger.update)
    refresh()
});

onUnmounted(() => {
    ctx.revert(); // <- Easy Cleanup!
});

const refresh = () => {
    ScrollTrigger.clearScrollMemory();
    window.history.scrollRestoration = "manual";
    ScrollTrigger.refresh(true);
};
</script>
<style>
#frame {
    z-index: 100;
    pointer-events: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    padding: 1.5rem 2rem;
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas: "title links sponsor" "credits credits credits";
    grid-column-gap: 3vw;
    grid-row-gap: 1rem;
    justify-content: space-between;
    align-content: space-between;
    text-align: left;
}

@media screen and (min-width: 53em) {
    .frame {
        height: 100vh;
        align-items: space-between;
    }
}
</style>
