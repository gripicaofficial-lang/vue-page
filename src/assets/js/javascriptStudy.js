// ContentShowHide
const openCloseControllButton = document.querySelector("#txtButton");	//버튼>동작을 시작하기 위한 버튼 변수 지정, 쿼리셀렉터 css 조작시 사용하면 좋음, getElementID는 데이터 관련?
const cardDetail = document.querySelectorAll(".notice__list>div");		//카드박스>컨트롤 할 태그 or id, class 값 변수 지정

if(openCloseControllButton){
	openCloseControllButton.onclick = function(){		//버튼 변수 클릭시 다음 함수 실행
		cardDetail.forEach(function(tag) {
			tag.classList.toggle('detail');					//버튼 변수 클릭>카드박스 detail 클래스 추가 함수
			if (tag.classList.contains('detail')) {		//만약 tag.classList.toggle 상태에서 contains 검사시 detail 클래스를 가지고 있다면
				openCloseControllButton.innerText = 'Content Text Show';		//detail 클래스 가지고 있다면>Content Text Show 텍스트를 innerText로 적용
			} else {
				openCloseControllButton.innerText = 'Content Text Hidden';	//detail 클래스 없다면>Content Text Hidden 텍스트를 innerText로 적용
			}
			// document.head.appendChild(style);
		})
		// const body = document.querySelector('body');
		// if(body){
		// 	console.log(body)
		// }
		// txtImage.classList.toggle('close');
	}
}

/* Theme */
document.addEventListener("DOMContentLoaded", function() {
	const themeButton = document.getElementById("themeButton");
	themeButton.addEventListener("click", function() {
	  const html = document.getElementsByTagName('html')[0];
	  let currentTheme = html.getAttribute("data-theme");
	  if (currentTheme === "day") {
		html.setAttribute("data-theme", "night");
		themeButton.innerHTML = themeButton.innerHTML.replace("DAY", "NIGHT");
	} else {
		html.setAttribute("data-theme", "day");
		themeButton.innerHTML = themeButton.innerHTML.replace("NIGHT", "DAY");
	  }
	});
 });

// ModalPopup
const modalPopupButton = document.getElementById('modalPopupButton');
const modalPopup = document.getElementById('modalPopup');
const modalPopupContent = document.getElementById('modalPopupContent');

if(modalPopupButton){
	modalPopupButton.onclick = function(e){
		e.stopPropagation()
		modalPopup.style.display = 'flex';
		setTimeout(function() {
			modalPopup.style.visibility = 'visible';
			modalPopup.style.opacity = '1';
		}, 4);
		modalPopup.classList.add('open');
	}; 
	modalPopupCloseButton.onclick = function(){
		setTimeout(function() {
			modalPopup.style.visibility = 'hidden';
			modalPopup.style.display = 'none';
		}, 400);
		modalPopup.style.opacity = '0';
		modalPopup.classList.remove('open');
	};
}
window.addEventListener('click', function(e){
	if(!e.target.closest("#modalPopupContent")) {
		if(modalPopup.classList.contains('open')){
			setTimeout(function(){
				modalPopup.style.visibility = 'hidden';
				modalPopup.style.display = 'none';
			}, 400);
			modalPopup.style.opacity = '0';
			modalPopup.classList.remove('open');
		}
	}
});

// ScrollTopAddClass
const quickMenu = document.getElementById('quick_menu');
const sideMenu = document.getElementById('fx__element');
window.onscroll = function() {scrollFunction()};
function scrollFunction(){
	var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	if(scrollTop > 80){
		document.getElementById('nav__bar').classList.add('sticky');
		document.getElementById('nav__bar').classList.remove('none');
		document.getElementById('gogiA').classList.add('on');
	} else {
		document.getElementById('nav__bar').classList.remove('sticky');
		document.getElementById('nav__bar').classList.add('none');
		document.getElementById('gogiA').classList.remove('on');
	}
	if(scrollTop > 120){
		sideMenu.classList.add('fixed');
	} else {
		sideMenu.classList.remove('fixed');
	}
	if(scrollTop > 500) {
		quickMenu.classList.add('fixed');
		setTimeout(function() {
			quickMenu.style.visibility = 'visible';
			quickMenu.style.opacity = '1';
		}, 4);
		setTimeout(function(){
			quickMenu.classList.add('animation__typeA');
		}, 1000);
	} else {
		quickMenu.classList.remove('animation__typeA');
		quickMenu.classList.remove('fixed');
		setTimeout(function() {
			quickMenu.style.visibility = 'hidden';
			quickMenu.style.opacity = '0';
		}, 4);
	}
}

// ViewZoomLevel
const scaleDefault = document.getElementById('viewDefault');
const scaleMedium = document.getElementById('viewMedium');
const scaleBig = document.getElementById('viewBig');
scaleDefault.onclick = function(e){
	var htmlElement = document.querySelector('html');
	htmlElement.style.zoom = '1.0';
}
scaleMedium.onclick = function(e){
	var htmlElement = document.querySelector('html');
	htmlElement.style.zoom = '1.1';
}
scaleBig.onclick = function(e){
	var htmlElement = document.querySelector('html');
	htmlElement.style.zoom = '1.2';
}

// ScrollMoveTopBottom
const topMoveButton = document.getElementById('topMovebtn');
const bottomMoveButton = document.getElementById('bottomMovebtn');
topMoveButton.addEventListener('click', function() {
	window.scrollTo({
		 top:0,
		 behavior:'smooth'
	});
});
bottomMoveButton.addEventListener('click', function() {
	window.scrollTo({
		top:document.documentElement.scrollHeight,
		behavior:'smooth'
	});
});

// ToastMessage
const msgCheckButton = document.getElementById('msgToastButton');
const msgToast = document.querySelector('#msg__toast');
const msgToastCloseButton = document.getElementById('msg__hidden__button');
if(msgCheckButton){
	msgCheckButton.onclick = function(e){
		msgToast.classList.add('show');
		if (msgToast.classList.contains('out')) {
			msgToast.classList.remove('out');
		}
	}
}
msgToastCloseButton.onclick = function(e){
	if(msgToast.classList.contains('show')){
		msgToast.classList.remove('show');
		msgToast.classList.add('out');
		setTimeout(function(){
			msgToast.classList.remove('out')
		}, 500);
	}
}

// BrowserMobileNavModeAddClassWidth
const mobileMode = document.querySelector('body');
window.addEventListener('resize', function() {
	if (window.innerWidth <= 1024) {
		mobileMode.classList.add('mobile__mode');

	} else {
		mobileMode.classList.remove('mobile__mode');
	}
});

// inputOpenButton
const searchOpenButton = document.getElementById('inputOpenButton');
const searchModalPopup = document.getElementById('modalSearchPopup');
const searchModalCloseButton = document.getElementById('modalSearchCloseButton');
searchOpenButton.onclick = function(e){
	searchModalPopup.classList.add('show');
	if(searchModalPopup.classList.contains('hidden')){
		searchModalPopup.classList.remove('hidden');
	}
}
searchModalCloseButton.onclick = function(e){
	if(searchModalPopup.classList.contains('show')) {
		searchModalPopup.classList.remove('show');
		searchModalPopup.classList.add('hidden');
		setTimeout(function(){
			searchModalPopup.style.display = 'none';
		}, 500);
	}
}

// 페이지 로드 시 초기 확인
if (window.innerWidth <= 4024) {
	mobileMode.classList.add('mobile__mode');
}

// // ScrollYAddClass__NavigationSticky
// // Header 포함 높이 계산
// const windowHeightWithHeader = window.innerHeight + document.querySelector("#header").offsetHeight;

// // 스크롤 이벤트 핸들러
// function scrollAction() {
//   const scrollElements = document.querySelectorAll(".scroll");

//   if (!scrollElements) {
//     return;
//   }

//   scrollElements.forEach((scrollElement) => {
//     const scrollHeight = scrollElement.getBoundingClientRect().top + 200;
//     scrollElement.classList.toggle("scrollAction", windowHeightWithHeader > scrollHeight);
//   });
// }

// // 애니메이션 이벤트 핸들러
// function scaleEvent(selector) {
//   const imgWrap = document.querySelector(selector);
//   const imgWrapHeight = imgWrap && imgWrap.getBoundingClientRect().top;
//   if (imgWrap && imgWrapHeight) {
//     imgWrap.classList.toggle("on", windowHeightWithHeader > imgWrapHeight);
//   }
// }

// // 애니메이션 delay 설정
// function aniDelay(elements, delay) {
//   elements.forEach((element, index) => {
//     element.style.animationDelay = delay * index + "s";
//   });
// }

// // 실행
// const delayList = document.querySelectorAll('.delayList');

// document.addEventListener("scroll", function () {
//   scrollAction();
//   scaleEvent('.delayScale ul');
// });

// document.addEventListener("DOMContentLoaded", function() {
//   aniDelay(delayList, 0.3);
// });