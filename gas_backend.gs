/**
 * Google Apps Script - GRIPICA 주문서 연동 및 재고 차감 로직
 * 
 * [배포 방법]
 * 1. 이 코드를 복사하여 Google Sheets의 [확장 프로그램] > [Apps Script] 편집기에 붙여넣습니다.
 * 2. 우측 상단의 [배포] > [배포 관리]를 클릭합니다.
 * 3. 연필(수정) 아이콘 > 버전 '새 버전' > [배포] 클릭!
 */

/**
 * 오더 번호 생성 함수
 * "2. 주문서" 시트를 읽어 당해 연도의 마지막 번호를 찾아 +1 한 새 번호를 반환합니다.
 */
function generateOrderId(sheet) {
  var year = new Date().getFullYear();
  var prefix = "ORD-" + year + "-";
  
  var data = sheet.getDataRange().getValues();
  var maxNum = 0;
  
  // 데이터가 있는 경우 마지막 행부터 위로 올라가면서 가장 큰 번호 찾기
  // order_id는 보통 1번째(A열, index 0)에 위치한다고 가정 (아니라면 수정 필요)
  var orderIdIdx = 0; 
  
  for (var i = data.length - 1; i > 0; i--) {
    var idStr = data[i][orderIdIdx] ? data[i][orderIdIdx].toString() : "";
    if (idStr.indexOf(prefix) === 0) {
      var numPart = idStr.substring(prefix.length);
      var num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  
  var nextNum = maxNum + 1;
  // 4자리 포맷 (예: 0001)
  var paddedNum = ("0000" + nextNum).slice(-4);
  return prefix + paddedNum;
}


function doPost(e) {
  var response = { success: false, message: "", order_id: "" };
  
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // ==========================================
    // 1. "2. 주문서" 시트에 주문 내역 기록 (20개 컬럼 스키마 반영)
    // ==========================================
    var orderSheet = ss.getSheetByName("2. 주문서");
    if (!orderSheet) throw new Error("'2. 주문서' 시트를 찾을 수 없습니다.");
    
    // 신규 오더 번호 채번
    var newOrderId = generateOrderId(orderSheet);
    
    var rowsToAppend = [];
    
    if (data.action === 'processOrder' && data.rows && Array.isArray(data.rows)) {
      data.rows.forEach(function(row) {
        // 채번된 오더 번호로 덮어쓰기
        row.order_id = newOrderId;
        
        rowsToAppend.push([
          row.order_id || '',
          row.product_id || '',
          row.order_type || '',
          row.order_date || '',
          row.buyer_name || '',
          row.buyer_email || '',
          row.country || '',
          row.product_title || '',
          row.quantity || 1,
          row.total_usd || 0,
          row.total_krw_1500 || 0,
          row.paypal_txn_id || '',
          row.shipping_address || '',
          row.tracking_number || '',
          row.policy || '',
          row.patreon_tier || '',
          row.used_coupon || '',
          row.discount || 0,
          row.status || '결재대기', // 사용자 기획에 따라 초기 상태는 결재대기
          row.memo || ''
        ]);
      });
    }

    if (rowsToAppend.length > 0) {
      rowsToAppend.forEach(function(r) {
        orderSheet.appendRow(r);
      });
    }
    
    // ==========================================
    // 2. "1. 작품리스트" 시트에서 재고 차감
    // ==========================================
    var productSheet = ss.getSheetByName("1. 작품리스트");
    if (productSheet && data.rows) {
      var productData = productSheet.getDataRange().getValues();
      var headers = productData[1]; // 2번째 행이 헤더
      
      var idIdx = headers.indexOf("product_id");
      if (idIdx === -1) idIdx = headers.indexOf("작품코드");
      var nameIdx = headers.indexOf("작품명");
      if (nameIdx === -1) nameIdx = headers.indexOf("title");
      
      var stockIdx = headers.indexOf("재고");
      if (stockIdx === -1) stockIdx = headers.indexOf("stock");
      
      if ((idIdx !== -1 || nameIdx !== -1) && stockIdx !== -1) {
        data.rows.forEach(function(orderItem) {
          var orderedId = orderItem.product_id;
          var orderedName = orderItem.product_title;
          var qtyRaw = orderItem.quantity;
          
          // 디지털/경매 무제한(Free, 해당없음)은 차감 제외
          if (qtyRaw === 'Free' || qtyRaw === '해당없음') return;
          
          var qty = parseInt(qtyRaw) || 1;
          
          for (var i = 2; i < productData.length; i++) {
            var match = false;
            if (idIdx !== -1 && String(productData[i][idIdx]).trim() === String(orderedId).trim()) {
              match = true;
            } else if (nameIdx !== -1 && String(productData[i][nameIdx]).trim() === String(orderedName).trim()) {
              match = true;
            }
            
            if (match) {
              var currentStockStr = productData[i][stockIdx];
              var currentStock = parseInt(currentStockStr, 10);
              
              if (!isNaN(currentStock)) {
                var newStock = Math.max(0, currentStock - qty); 
                productSheet.getRange(i + 1, stockIdx + 1).setValue(newStock);
              }
              break;
            }
          }
        });
      }
    }
    
    response.success = true;
    response.message = "주문 처리가 완료되었습니다.";
    response.order_id = newOrderId; // 프론트엔드로 전달
    
  } catch (err) {
    response.success = false;
    response.message = err.toString();
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * [트리거 전용] 3일 경과 미입금 인보이스 자동 취소 및 재고 원복
 * 사용법: 앱스 스크립트 > 트리거(시계 아이콘) > 이 함수를 '시간 기반', '매일' 실행되도록 설정
 */
function checkExpiredInvoices() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orderSheet = ss.getSheetByName("2. 주문서");
  var productSheet = ss.getSheetByName("1. 작품리스트");
  
  if (!orderSheet || !productSheet) return;
  
  var orderData = orderSheet.getDataRange().getValues();
  // 가정: 1행이 헤더 (A1~Z1)
  var headers = orderData[0];
  
  var dateIdx = headers.indexOf("order_date");
  var titleIdx = headers.indexOf("product_title");
  if (titleIdx === -1) titleIdx = headers.indexOf("product_id"); // 제목 컬럼 대용
  var qtyIdx = headers.indexOf("quantity");
  var statusIdx = headers.indexOf("status");
  var memoIdx = headers.indexOf("memo");
  
  if (dateIdx === -1 || statusIdx === -1 || memoIdx === -1) return; // 필수 컬럼 없음
  
  var now = new Date();
  var threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  
  // 변경된 내용을 기록할 객체 (재고 원복용) { "작품명": 반환할수량 }
  var returnStocks = {};
  
  for (var i = 1; i < orderData.length; i++) {
    var status = orderData[i][statusIdx];
    if (status === '인보이스발행') {
      var orderDateStr = orderData[i][dateIdx];
      var orderDate = new Date(orderDateStr);
      
      // 날짜 파싱이 불가능하면 스킵
      if (isNaN(orderDate.getTime())) continue;
      
      // 3일이 지났는지 검사
      if (now.getTime() - orderDate.getTime() >= threeDaysInMs) {
        // 취소 처리 (대표님 요청값으로 변경)
        orderSheet.getRange(i + 1, statusIdx + 1).setValue('취소/환불');
        orderSheet.getRange(i + 1, memoIdx + 1).setValue('미입금 취소');
        
        // 재고 원복을 위해 수량 합산
        var pTitle = orderData[i][titleIdx];
        var qty = parseInt(orderData[i][qtyIdx]) || 1;
        if (pTitle) {
          if (!returnStocks[pTitle]) returnStocks[pTitle] = 0;
          returnStocks[pTitle] += qty;
        }
      }
    }
  }
  
  // 작품 시트 재고 원복 처리
  var productData = productSheet.getDataRange().getValues();
  var pHeaders = productData[1]; // 2번째 행이 헤더 (api.js 기준)
  var pNameIdx = pHeaders.indexOf("작품명");
  if (pNameIdx === -1) pNameIdx = pHeaders.indexOf("title");
  var pStockIdx = pHeaders.indexOf("재고");
  if (pStockIdx === -1) pStockIdx = pHeaders.indexOf("stock");
  
  if (pNameIdx !== -1 && pStockIdx !== -1) {
    for (var j = 2; j < productData.length; j++) {
      var pName = productData[j][pNameIdx];
      if (returnStocks[pName]) {
        var curStock = parseInt(productData[j][pStockIdx]) || 0;
        var restoredStock = curStock + returnStocks[pName];
        productSheet.getRange(j + 1, pStockIdx + 1).setValue(restoredStock);
        
        // 처리한 작품은 0으로 초기화
        returnStocks[pName] = 0;
      }
    }
  }
}
