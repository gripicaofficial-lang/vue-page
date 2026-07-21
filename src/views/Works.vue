<template>
	<div class="container">
		<main>
			<div class="main__layout_bx">

				<PageTitle 
					title="Works" 
					project="디바이스 UI" 
					features="sd" 
				/>

				<h4>UX/UI Engineer 신창언입니다.</h4>
				<p>메인 페이지는 기획 단계에 있으므로, PAD 메뉴로 접근해주세요.</p>
				<h5>카테고리 인포메이션</h5>
				<table>

				</table>
				<router-link to="/Pad">Pad_ui 바로가기</router-link>
			</div>
		</main>
		<QuickBanner></QuickBanner>
    </div>
</template>
<script setup>
import PageTitle from '@/layout/PageTitle.vue'
</script>
<style lang="scss"></style>