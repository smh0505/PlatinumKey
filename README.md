# 백금열쇠

## 김편집의 리듬마블

김편집의 리듬마블은 트위치 스트리머 [김편집_](https://kimpyun.zip)님의 컨텐츠 중에 하나로,
스트리머가 주사위를 굴려 나온 눈만큼 이동하며 도착한 칸의 주제의 맞는 곡을 선곡받아 플레이하는 컨텐츠입니다.

이 컨텐츠는 스트리머가 3바퀴를 완주하거나 일정량의 포인트를 모을 때까지 계속되며,
시청자들은 트위치 챗으로 원하는 곡을 선곡하거나 투네이션 룰렛 후원을 통해 참여할 수 있습니다.

## 백금열쇠

백금열쇠는 김편집의 리듬마블을 보다 쉽고 편리하게 진행하는 것을 목적으로 제작되었습니다.
이 웹앱은 다음 조건을 기반으로 하여 제작되었으며, 따라서 다음과 같이 설정하는 것을 추천드립니다.

- **사이즈**: 1920px × 1080px
- **플랫폼**: OBS 브라우저 소스
  - **페이지 권한**: OBS에 고급 접근 권한

## 현재 버전: Ver.1.5

이 웹앱은 [여기](https://smh0505.github.io/PlatinumKey)를 클릭하거나 주소창에 https://smh0505.github.io/PlatinumKey 를 입력하는 것으로 접속 및 사용할 수 있습니다.

이전 버전에 대한 내용은 [여기](./devlogs/README.md)를 참조하시기 바랍니다.

- **주사위 텍스쳐가 추가**되었습니다.

| **주사위** | **사진** |
| :---: | :---: |
| 일반 주사위<br />(**0**, **1**, **2**, **3**) × 2 | ![normal](./images/normal_dice.png) |
| 저속 주사위<br />(**0** × 4, **1** × 4, **2** × 2) | ![slow](./images/slow_dice.png) |
| 고속 주사위<br />(**2** × 2, **3** × 4, **4** × 4) | ![fast](./images/fast_dice.png) |
| 후진 주사위<br />(**-4** × 2, **-3** × 2, **-2** × 2, **-1** × 2, **1** × 2) | ![back](./images/back_dice.png) |
| 전진 주사위<br />(**1**, **2**, **3**, **4**) | ![force](./images/force_dice.png) |
| 열쇠 주사위<br />(**앞** × 4, **뒤** × 4) | ![key](./images/key_dice.png) |
| 막고라 주사위<br />(**디맥** × 2, **투온** × 2, **식스타** × 2, **아르케아** × 2) | ![battle](./images/battle_dice.png) |
| 조커 주사위<br />(**4** × 4, **0** × 2, **-4** × 4) | ![joker](./images/joker_dice.png) |
| 모서리 주사위<br />(**왼쪽 아래** × 2, **왼쪽 위** × 2, **오른쪽 위** × 2) | ![corner](./images/corner_dice.png) |

- **페이즈 도전 기능이 추가**되었습니다.
  - 출발을 지날 때마다 페이즈 도전 버튼을 클릭하여 **현재 페이즈에 도전**할 수 있습니다.
  - ![phase](./images/phase.png)
  - 규칙이 변경됨에 따라 **퇴근 조건이 3페이즈 통과**로 변경됩니다.
- **직전 곡 추첨 취소 기능이 추가**되었습니다. (임시)
  - ![rollback](./images/rollback.gif)
  - "직전 추첨 취소" 버튼을 클릭하여 마지막으로 추첨된 선곡을 취소할 수 있습니다.
  - **\[주의!]** 추첨되면서 제외된 **다른 선곡들은 <ins>돌아오지 않습니다</ins>**.
  - "직전 추첨 취소" 버튼은 **클릭하는 즉시 적용**됩니다. (추후, 확인 과정을 추가할 예정입니다.)
  - ![rollbackresult](./images/rollback_result.gif)
  - 직전 곡의 추첨이 취소되는 경우, 해당 곡이 추첨된 주제의 **밟은 횟수가 1 감소**합니다.
    - 라인 독점 상태에서 직전 곡 추첨 취소 기능을 사용하여 **어느 한 칸의 밟은 횟수가 0**이 되는 경우 <ins>**즉시 라인 독점이 풀립니다**</ins>.

## 라이브러리 및 프레임워크

- Vite
- Vue
- Typescript
- Sass
- Pinia
- Vue-Konva
- Luxon
- LocalForage
- Fantastic Dice (3D Dice/Dice-Box)

## 빌딩

```shell
git clone https://github.com/smh0505/PlatinumKey.git
cd PlatinumKey
npm install
npm run dev
```

## 라이센스

이 웹앱은 [MIT 라이센스](./LICENSE)를 따르고 있습니다.

## Special Thanks

[김편집_](https://kimpyun.zip)\
[양치기양](https://github.com/ShepherdingSheep)\
[hibiya](https://github.com/hibiyasleep)\
[채팅_안치는사람](https://github.com/orphues12)\
[cannabee.](https://youtube.com/@cannabee)

**그리고 여러분**
