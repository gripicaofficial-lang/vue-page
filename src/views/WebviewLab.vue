<template>
	<div class="container">
		<main>

			<PageTitle 
        title="WebviewLAB" 
        project="디바이스 UI" 
        features="sd" 
      />

			<div class="pad__layout" :class="{ setup: isSetup }">
				
				<div class="pad__layout_pannel">
					<div class="pad__layout_camera"><span></span></div>
					<div class="pad__layout_screen">

						<!-- [레이어팝업_레이어팝업] -->
						<div class="app_view" :class="{ open: isOpen }">
							<div class="app_view_content folder">
								<h3>폴더</h3>
								<div>
									<div>
										<h4>123123</h4>
										<div class="app_view_contenttxt">asdasd</div>
									</div>
									<button type="button" id="app_view_closebutton" @click="toggleClassToAppView">닫기</button>
								</div>
							</div>
						</div>

						<!-- [레이어팝업_지도] -->
						<div class="app_view" :class="{ open: isOpen2 }">
							<div class="app_view_content map">
								<div><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.807066988949!2d127.09996271272303!3d37.51246832710791!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca50a915f665b%3A0xabeb10cd5efdfce2!2z66Gv642w7JuU65Oc7YOA7JuM!5e0!3m2!1sko!2skr!4v1711696403769!5m2!1sko!2skr" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
								<button type="button" id="app_view_closebutton" @click="toggleClassToAppView2">닫기</button>
							</div>
						</div>

						<!-- [레이어팝업_네이버] -->
						<div class="app_view" :class="{ open: isOpen3 }">
							<div class="app_view_content naver">
								<button type="button" id="app_view_closebutton" @click="toggleClassToAppView3">닫기</button>
							</div>
						</div>

						<ul>
							<li>
								<button type="button" id="app_open" class="popup" @click="toggleClassToAppView">
									<span></span>
									<p>폴더</p>
								</button>
							</li>
							<li>
								<button type="button" class="map" @click="toggleClassToAppView2">
									<span></span>
									<p>지도</p>
								</button>
							</li>
							<li>
								<button type="button" class="paint_board">
									<span></span>
									<p>그림판</p>
								</button>
							</li>
							<li>
								<button type="button" class="daum">
									<span></span>
									<p>찾기</p>
								</button>
							</li>
							<li>
								<button type="button" class="naver" @click="toggleClassToAppView3">
									<span></span>
									<p>NAVER</p>
								</button>
							</li>
							<li>
								<button type="button" class="calculator">
									<span></span>
									<p>계산기</p>
								</button>
							</li>
							<li>
								<button type="button" class="kakaotalk">
									<span></span>
									<p>메신저</p>
								</button>
							</li>
							<li>
								<button type="button" class="music">
									<span></span>
									<p>음악</p>
								</button>
							</li>
						</ul>
					</div>
					<div class="pad__layout_homebutton">
						<button type="button" @click="appViewCloseAll"></button>
					</div>
				</div>
				<button type="button" id="pad__layout_button" @click="toggleSetup">{{ buttonText }}</button>
				<div class="pad__layout_background"></div>
			</div>

			<ButtonDefault></ButtonDefault>

      <!-- [CoinEffect] -->
			<div class="modal__popup">
				<!-- [노출]
				1.팝업을 노출하려면 show 클래스 추가 -->
				<div class="coin__animation ani">
					<div class="coin__animation_effect">
						<div>
							<div class="coin__animation_item">
								<div>
									<div>P</div>
								</div>
							</div>
							<div class="coin__animation_item">
								<div>
									<div>P</div>
								</div>
							</div>
							<div class="coin__animation_item">
								<div>
									<div>P</div>
								</div>
							</div>
						</div>
						<div><strong>40P</strong>가 적립되었습니다.</div>
					</div>
					<div class="conin_animation_mypoint">총 적립 포인트 : <strong><span>23,333</span> P</strong></div>
					<canvas ref="goldMoneyCanvas" width="2000" height="1000"></canvas>
				</div>
			</div>

			<div class="details__summary_bx" style="display:none">
				<details v-for="(item, index) in detailsList" :key="index" @toggle="handleToggle">
					<summary>{{ item.summary }}</summary>
					<div>{{ item.content }}</div>
				</details>
			</div>

		</main>
		<QuickBanner></QuickBanner>
    </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import ButtonDefault from '@/components/item/ButtonDefault.vue';
import QuickBanner from '@/views/QuickBanner.vue';
import PageTitle from '@/layout/PageTitle.vue';

// 1. 상태 관리 (기존 data)
const isOpen = ref(false);
const isOpen2 = ref(false);
const isOpen3 = ref(false);
const isSetup = ref(false);
const coins = ref([]);
const cw = ref(0);
const ch = ref(0);
const dpi = window.devicePixelRatio;
const raf = ref(null);
const goldMoneyCanvas = ref(null); // canvas ref 연결

const detailsList = ref([
  { summary: "Details 1", content: "Content of Details 1" },
  { summary: "Details 2", content: "Content of Details 2" },
  { summary: "Details 3", content: "Content of Details 3" }
]);

// 2. 계산된 속성 (기존 computed)
const buttonText = computed(() => {
  return isSetup.value ? "PAD OFF" : "PAD ON";
});

// 3. 함수 정의 (기존 methods)
const toggleSetup = () => {
  isSetup.value = !isSetup.value;
};

const appViewCloseAll = () => {
  isOpen.value = false;
  isOpen2.value = false;
  isOpen3.value = false;
};

const toggleClassToAppView = () => isOpen.value = !isOpen.value;
const toggleClassToAppView2 = () => isOpen2.value = !isOpen2.value;
const toggleClassToAppView3 = () => isOpen3.value = !isOpen3.value;

// 4. 감시자 (기존 watch)
watch(isSetup, (newValue) => {
  if (!newValue) {
    appViewCloseAll();
  }
});

// 5. 캔버스 애니메이션 로직
const fixDpi = () => {
  const canvas = goldMoneyCanvas.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpi;
  canvas.height = rect.height * dpi;
};

const setupCoins = () => {
  const canvas = goldMoneyCanvas.value;
  if (!canvas) return;
  cw.value = canvas.width;
  ch.value = canvas.height;
  if (coins.value.length > 0) return;

  for (let i = 0; i < 20; i++) {
    coins.value.push({
      x: cw.value * 0.5,
      y: ch.value * 0.5,
      vx: (Math.random() - .5) * (cw.value / 200),
      vy: -Math.random() * (ch.value / 200),
      radius: 2.5,
      color: "#ffb007"
    });
  }
};

const coinDraw = (coin) => {
  const canvas = goldMoneyCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = coin.color;
  ctx.fill();
};

const screenDraw = () => {
  const canvas = goldMoneyCanvas.value;
  if (!canvas) {
    raf.value = null;
    return;
  }
  const ctx = canvas.getContext("2d");
  fixDpi();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (coins.value.length) {
    coins.value.forEach((coin, index) => {
      if (coin.y - coin.radius > canvas.height) {
        coins.value.splice(index, 1);
      }
      coinDraw(coin);
      coin.x += coin.vx;
      coin.y += coin.vy;
      coin.vy *= 0.9999;
      coin.vy += ch.value / 10000;
    });
  } else {
    setupCoins();
  }
  raf.value = window.requestAnimationFrame(screenDraw);
};

// 6. 라이프사이클 훅
onMounted(() => {
  if (goldMoneyCanvas.value) {
    setupCoins();
    screenDraw();
  }
});

onBeforeUnmount(() => {
  if (raf.value) {
    window.cancelAnimationFrame(raf.value);
  }
});
</script>
<style lang="scss"></style>