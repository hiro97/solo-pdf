# Annotation Rotation Testing Guide

## 🚀 Quick Start

1. 브라우저에서 http://localhost:3000 접속
2. PDF 파일 업로드 (최소 2-3 페이지 권장)
3. 브라우저 개발자 도구 열기 (F12)
4. Console 탭으로 이동
5. 아래 테스트를 순서대로 진행

---

## ✅ Test 1: Basic Rotation - Annotations Stay Visible

**목적**: 회전 후 annotation이 즉시 보이는지 확인

### 수동 테스트 단계:
1. 텍스트 도구 선택
2. 페이지 좌측 상단에 "TEST" 입력
3. 회전 버튼 클릭 (90°)

### ✅ 성공 조건:
- [ ] 텍스트가 **즉시** 표시됨 (페이지 클릭 불필요)
- [ ] 텍스트가 올바른 위치에 회전되어 표시
- [ ] 콘솔에 `[AnnotationLayer] Transforming annotation from 0° to 90°` 로그 출력

### ❌ 실패 증상:
- 텍스트가 사라지고 페이지 클릭 후에만 나타남
- 텍스트 위치가 틀림

---

## ✅ Test 2: New Annotations After Rotation

**목적**: 회전된 상태가 "새로운 원본"으로 작동하는지 확인

### 수동 테스트 단계:
1. 페이지를 90° 회전
2. 텍스트 도구로 "AFTER ROTATION" 입력
3. 다시 90° 회전 (총 180°)
4. 또 90° 회전 (총 270°)
5. 마지막으로 90° 회전 (총 360° = 0°)

### ✅ 성공 조건:
- [ ] 새 텍스트가 모든 회전 단계에서 즉시 보임
- [ ] 새 텍스트가 페이지와 함께 회전
- [ ] 올바른 위치 유지

### ❌ 실패 증상:
- 새 텍스트가 0° 방향으로 생성됨
- 회전 시 텍스트가 사라짐

---

## ✅ Test 3: 360° Rotation - No Drift

**목적**: 여러 번 회전 후 원위치로 정확히 돌아오는지 확인

### 수동 테스트 단계:
1. 사각형 도구로 특정 위치에 사각형 그리기 (위치 기억)
2. 회전 버튼 4번 클릭 (90° × 4 = 360°)

### ✅ 성공 조건:
- [ ] 사각형이 정확히 원래 위치로 복귀
- [ ] 위치 드리프트 없음
- [ ] 각도도 원래대로

### ❌ 실패 증상:
- 사각형이 조금씩 이동
- 각도가 변함

---

## ✅ Test 4: Multiple Annotation Types

**목적**: 모든 annotation 타입이 올바르게 회전하는지 확인

### 수동 테스트 단계:
1. 다음 객체들을 추가:
   - 텍스트 "TEXT"
   - 사각형 (Rectangle)
   - 원 (Circle)
   - 자유 그리기 (Drawing)
2. 90° 회전

### ✅ 성공 조건:
- [ ] 모든 객체가 즉시 표시됨
- [ ] 모든 객체가 올바른 위치에 회전됨
- [ ] 상대적 위치 관계 유지

### ❌ 실패 증상:
- 특정 타입만 사라짐
- 위치가 틀림

---

## ✅ Test 5: Mixed Rotation Angles

**목적**: 서로 다른 각도에서 생성된 annotation들의 변환 확인

### 수동 테스트 단계:
1. 0°에서 텍스트 "0°" 추가
2. 90° 회전 후 텍스트 "90°" 추가
3. 90° 더 회전 (180°) 후 텍스트 "180°" 추가
4. 90° 더 회전 (270°) 후 텍스트 "270°" 추가
5. 90° 더 회전 (360° = 0°)

### ✅ 성공 조건:
- [ ] 모든 4개 텍스트가 올바른 위치에 표시
- [ ] 각 텍스트가 원래 생성된 방향 유지
- [ ] "0°" 텍스트가 정확히 처음 위치로 복귀

---

## ✅ Test 6: Multi-Page (Edge Case)

**목적**: 여러 페이지의 독립적인 회전 처리 확인

### 수동 테스트 단계:
1. 페이지 1에 텍스트 "PAGE 1" 추가
2. 페이지 2로 스크롤, 텍스트 "PAGE 2" 추가
3. 페이지 1 선택 후 회전 (90°)
4. 페이지 2 확인

### ✅ 성공 조건:
- [ ] 페이지 1만 회전
- [ ] 페이지 2는 회전하지 않음
- [ ] 각 페이지의 annotation이 올바르게 표시

---

## ✅ Test 7: Zoom Level Changes (Edge Case)

**목적**: 줌과 회전이 독립적으로 작동하는지 확인

### 수동 테스트 단계:
1. 텍스트 annotation 추가
2. 90° 회전
3. 줌 인 (150%)
4. 줌 아웃 (50%)
5. 다시 100%

### ✅ 성공 조건:
- [ ] 모든 줌 레벨에서 annotation 정확히 표시
- [ ] 회전 상태 유지
- [ ] 위치 변경 없음

---

## ✅ Test 8: Undo/Redo + Rotation (Edge Case)

**목적**: 실행 취소 기능과 회전의 상호작용 확인

### 수동 테스트 단계:
1. 텍스트 "BEFORE" 추가
2. 90° 회전
3. 텍스트 "AFTER" 추가
4. Undo (Ctrl+Z)
5. Redo (Ctrl+Shift+Z)

### ✅ 성공 조건:
- [ ] Undo 시 "AFTER" 텍스트만 제거
- [ ] "BEFORE" 텍스트는 회전된 상태로 유지
- [ ] Redo 시 "AFTER" 텍스트 복원 (회전된 위치에)

---

## ✅ Test 9: Save & Reload (Edge Case)

**목적**: 회전된 annotation이 저장 후에도 유지되는지 확인

### 수동 테스트 단계:
1. 텍스트 annotation 추가
2. 90° 회전
3. 다운로드/저장
4. 페이지 새로고침 (F5)
5. 같은 PDF 다시 업로드

### ✅ 성공 조건:
- [ ] Annotation이 회전된 상태로 복원
- [ ] 위치 정확히 유지

---

## ✅ Test 10: Complex Scenario (Stress Test)

**목적**: 복잡한 시나리오에서 안정성 확인

### 수동 테스트 단계:
1. 10개 이상의 다양한 annotation 추가
2. 90° 회전
3. 5개 더 추가
4. 180° 회전 (총 270°)
5. 3개 삭제
6. 90° 회전 (총 360° = 0°)

### ✅ 성공 조건:
- [ ] 모든 annotation이 올바른 위치
- [ ] 성능 저하 없음
- [ ] 콘솔 에러 없음

---

## 🔍 Debugging Checklist

### 콘솔 로그 확인:
```
[AnnotationLayer] Transforming annotation from X° to Y°
```
- 이 로그가 회전 시 나타나야 함
- fromRotation과 toRotation이 올바른 값

### 에러 체크:
콘솔에 다음 에러가 **없어야** 함:
- `TypeError`
- `ReferenceError`
- `Fabric.js error`
- `Canvas rendering error`

### 네트워크 체크:
- HMR (Hot Module Reload) 정상 작동
- 페이지 리로드 없이 변경사항 반영

---

## 📊 Test Results Template

각 테스트 완료 후 체크:

```
✅ Test 1: PASS
✅ Test 2: PASS
✅ Test 3: PASS
✅ Test 4: PASS
✅ Test 5: PASS
✅ Test 6: PASS
✅ Test 7: PASS
✅ Test 8: PASS
✅ Test 9: PASS
✅ Test 10: PASS
```

실패한 테스트가 있으면:
```
❌ Test X: FAIL
증상: [상세 설명]
콘솔 에러: [에러 메시지]
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Annotations disappear after rotation
**증상**: 회전 후 annotation이 사라지고 클릭 시에만 나타남
**원인**: `pageRotation` 파라미터 전달 실패
**확인**: 콘솔에 transformation 로그가 나타나는지 확인

### Issue 2: New annotations in wrong orientation
**증상**: 회전 후 새로 만든 annotation이 0° 방향으로 생성
**원인**: 새 annotation 생성 시 현재 pageRotation이 저장되지 않음
**확인**: 브라우저 개발자 도구에서 annotation 객체의 pageRotation 값 확인

### Issue 3: Position drift after multiple rotations
**증상**: 360° 회전 후 원위치로 돌아오지 않음
**원인**: Transformation 수학 오류 또는 scaled/unscaled dimensions 혼용
**확인**: 콘솔에서 transformation 계산 로그 확인

---

## 🎯 Critical Success Criteria

모든 테스트를 통과하려면:

1. **즉시 표시**: 회전 후 클릭 없이 annotation이 즉시 보여야 함
2. **올바른 변환**: 모든 annotation이 올바른 위치에 회전되어야 함
3. **일관성**: 여러 회전 후에도 위치 드리프트 없어야 함
4. **독립성**: 줌, 다중 페이지 등 다른 기능과 독립적으로 작동
5. **안정성**: 콘솔 에러 없이 모든 시나리오에서 안정적으로 작동

---

## 💡 Pro Tips

1. **콘솔 로그 활성화**: 개발자 도구 → Console → Show timestamps
2. **네트워크 탭 확인**: 예기치 않은 리로드가 발생하는지 확인
3. **메모리 사용량**: Performance 탭에서 메모리 누수 확인
4. **Fabric.js 객체**: 콘솔에서 `canvas.getObjects()` 실행하여 객체 확인

---

## 📝 테스트 완료 후

모든 테스트가 완료되면 다음 정보를 공유:

1. 통과/실패한 테스트 목록
2. 발견된 버그 및 에러 메시지
3. 콘솔 로그 스크린샷 (중요한 부분)
4. 예상치 못한 동작 설명

Happy Testing! 🎉
