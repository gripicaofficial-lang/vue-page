<template>
	<div class="container">
		<main>
			<div class="main__layout_bx">

				<div class="page__title_bx" :class="{ on: isTargetPage }">
					<h2>News<span>2026.04.01</span></h2>
					<div>
						<p>프로젝트명 : 디바이스 UI</p>
						<p>기능구현 : 패드 ON/OFF 상태, 패드 HOME 버튼 동작, 각 아이콘 별 팝오버&amp;간략 기능 구현</p>
					</div>
				</div>

				<h4>UX/UI Engineer 신창언입니다.</h4>
				<p>메인 페이지는 기획 단계에 있으므로, PAD 메뉴로 접근해주세요.</p>
				<h5>카테고리 인포메이션</h5>
				<table>

				</table>
				<router-link to="/Pad">Pad_ui 바로가기</router-link>
			</div>
		</main>
    </div>
</template>
<script>
import { ref } from 'vue';

export default {
    setup() {
        const isTargetPage = ref(true);
        return { isTargetPage };
    }
};
</script>
<style lang="scss"></style>
