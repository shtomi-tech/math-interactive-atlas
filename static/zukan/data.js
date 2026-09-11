const SOURCE = {
  repository: "shtomi-tech/math-practice",
  license: "Original implementation / repository terms",
  url: "https://github.com/shtomi-tech/math-practice",
  usage: "original"
};

export const INTERACTION_LABELS = {
  slider: "SLIDER",
  drag: "DRAG",
  geometry: "GEOMETRY",
  select: "SELECT",
  cards: "CARDS",
  data: "DATA"
};

export const CONTENTS = [
  {
    id: "quadratic-vertex",
    subject: "math1",
    unit: "二次関数",
    topic: "グラフと頂点",
    title: "頂点を動かす",
    shortDescription: "a・p・qを動かすと、放物線の形と頂点がどう変わるかを観察します。",
    formula: "y = a(x − p)² + q",
    interactionType: "slider",
    component: "quadratic-vertex",
    instructions: "a・p・qのスライダーを動かして、頂点と軸の位置を見比べます。",
    discoveryPoints: [
      "pは頂点のx座標、qは頂点のy座標をそのまま動かす。",
      "aの絶対値が大きいほど、放物線は細くなる。",
      "aが負になると、開く向きだけが反転する。"
    ],
    related: ["quadratic-discriminant", "quadratic-range"],
    source: SOURCE,
    difficulty: "basic"
  },
  {
    id: "quadratic-discriminant",
    subject: "math1",
    unit: "二次関数",
    topic: "判別式",
    title: "判別式と交点数",
    shortDescription: "bとcを動かし、放物線とx軸の交点が判別式と連動する様子を見ます。",
    formula: "D = b² − 4ac",
    interactionType: "slider",
    component: "quadratic-discriminant",
    instructions: "b・cを動かし、Dの符号とx軸との交点数を観察します。aは1に固定しています。",
    discoveryPoints: [
      "D＞0では交点が2個、D＝0では1個、D＜0では交点がない。",
      "D＝0のとき、頂点がちょうどx軸上に来る。",
      "交点の個数は、二次方程式の実数解の個数でもある。"
    ],
    related: ["quadratic-vertex", "quadratic-range"],
    source: SOURCE,
    difficulty: "basic"
  },
  {
    id: "quadratic-range",
    subject: "math1",
    unit: "二次関数",
    topic: "最大・最小",
    title: "最大・最小と定義域",
    shortDescription: "定義域の端点を動かして、最大値・最小値がどこで決まるかを確かめます。",
    formula: "y = (x − 1)² + 1　（l ≤ x ≤ r）",
    interactionType: "drag",
    component: "quadratic-range",
    instructions: "グラフ上のl・rを左右にドラッグします。定義域の中だけが色づきます。",
    discoveryPoints: [
      "頂点が定義域に入ると、最小値は頂点で決まる。",
      "定義域の端点も、最大・最小の候補になる。",
      "定義域を狭めると、同じ関数でも値の範囲が変わる。"
    ],
    related: ["quadratic-vertex", "quadratic-discriminant"],
    source: SOURCE,
    difficulty: "standard"
  },
  {
    id: "unit-circle",
    subject: "math1",
    unit: "三角比",
    topic: "単位円",
    title: "単位円でsin・cos",
    shortDescription: "円周上の点を動かし、cosとsinが座標として現れることを観察します。",
    formula: "cos θ = x　／　sin θ = y",
    interactionType: "geometry",
    component: "unit-circle",
    instructions: "円周上の点をドラッグします。角度、座標、sin・cosの値が同時に変化します。",
    discoveryPoints: [
      "単位円では、半径が1なので座標がそのままcosとsinになる。",
      "点を一周させると、sinとcosは−1から1の間を動く。",
      "点の高さがsin、横位置がcosを表している。"
    ],
    related: ["triangle-area-sine", "triangle-centers"],
    source: SOURCE,
    difficulty: "basic"
  },
  {
    id: "triangle-area-sine",
    subject: "math1",
    unit: "三角比",
    topic: "三角形の面積",
    title: "三角形の面積とsin",
    shortDescription: "頂点を動かして、面積が高さとsinの両方で表せることを見ます。",
    formula: "S = ½ab sin C",
    interactionType: "geometry",
    component: "triangle-area-sine",
    instructions: "上の頂点Cをドラッグします。面積・角度・sinの値を見比べます。",
    discoveryPoints: [
      "底辺×高さ÷2と、½ab sin Cは同じ面積を表す。",
      "角度Cが直角のとき、sin C＝1で面積は最大になる。",
      "角度が小さくなると、高さも面積も小さくなる。"
    ],
    related: ["unit-circle", "triangle-centers"],
    source: SOURCE,
    difficulty: "basic"
  },
  {
    id: "set-regions",
    subject: "mathA",
    unit: "集合と論理",
    topic: "集合の演算",
    title: "集合を塗って式を作る",
    shortDescription: "全体を4つの領域に分けて選び、集合の式と対応させます。",
    formula: "A ∩ B　／　A ∪ B　／　Aᶜ",
    interactionType: "select",
    component: "set-regions",
    instructions: "領域をクリックして塗ります。選んだ領域が集合の式に変わります。",
    discoveryPoints: [
      "共通部分A∩Bは、AとBの両方に入る領域。",
      "和集合A∪Bは、少なくとも一方に入る領域。",
      "補集合Aᶜは、Aに入らない領域を集めたもの。"
    ],
    related: ["conditional-probability", "permutation-cards"],
    source: SOURCE,
    difficulty: "basic"
  },
  {
    id: "permutation-cards",
    subject: "mathA",
    unit: "場合の数",
    topic: "順列",
    title: "順列を全部並べる",
    shortDescription: "カードを並べ替え、順序を区別すると並び方がどう増えるかを数えます。",
    formula: "n! = n(n − 1)(n − 2) ⋯ 1",
    interactionType: "cards",
    component: "permutation-cards",
    instructions: "カードの枚数を選びます。すべての並び方を表示し、個数を確認します。",
    discoveryPoints: [
      "1枚目はn通り、2枚目はn−1通りと、選択肢が減っていく。",
      "順序を区別するから、同じカードでも並びが変われば別になる。",
      "4枚にすると24通り。少し増えただけで一覧は急に長くなる。"
    ],
    related: ["set-regions", "conditional-probability"],
    source: SOURCE,
    difficulty: "basic"
  },
  {
    id: "conditional-probability",
    subject: "mathA",
    unit: "確率",
    topic: "条件付き確率",
    title: "条件付き確率で世界を絞る",
    shortDescription: "全体から条件Bの世界へ絞り込み、その中でAが占める割合を見ます。",
    formula: "P(A｜B) = n(A ∩ B) / n(B)",
    interactionType: "select",
    component: "conditional-probability",
    instructions: "「全体」から「Bだけ」に切り替えます。分母がどの人数に変わるかを見ます。",
    discoveryPoints: [
      "条件付き確率では、条件Bを満たすものだけが新しい全体になる。",
      "P(A｜B)の分母は、A∩BではなくB全体の個数。",
      "条件を付けると、割合の基準そのものが変わる。"
    ],
    related: ["set-regions", "permutation-cards"],
    source: SOURCE,
    difficulty: "standard"
  },
  {
    id: "mean-median",
    subject: "math1",
    unit: "データの分析",
    topic: "代表値",
    title: "平均と中央値を壊してみる",
    shortDescription: "データを動かし、外れ値が平均と中央値へ与える影響の違いを確かめます。",
    formula: "平均 = 合計 / 個数",
    interactionType: "data",
    component: "mean-median",
    instructions: "点を左右にドラッグします。平均はすぐ動き、中央値は順位が変わるまで待ちます。",
    discoveryPoints: [
      "大きく離れた値は、平均をその方向へ引っ張る。",
      "中央値は中央の順位で決まるため、外れ値の影響が比較的小さい。",
      "同じデータでも、代表値によって見える特徴が変わる。"
    ],
    related: ["quadratic-range", "triangle-area-sine"],
    source: SOURCE,
    difficulty: "basic"
  },
  {
    id: "triangle-centers",
    subject: "mathA",
    unit: "図形の性質",
    topic: "三角形の五心",
    title: "三角形の五心",
    shortDescription: "三角形の頂点を動かし、五つの中心がどのように移動するかを観察します。",
    formula: "G・O・H・I・N",
    interactionType: "geometry",
    component: "triangle-centers",
    instructions: "頂点Cをドラッグします。重心・外心・垂心・内心・九点中心を見比べます。",
    discoveryPoints: [
      "重心Gは3本の中線の交点で、三角形の内側にある。",
      "外心O・垂心H・重心Gは、一直線上（オイラー線）に並ぶ。",
      "三角形の形が変わると、中心どうしの位置関係も動く。"
    ],
    related: ["unit-circle", "triangle-area-sine"],
    source: SOURCE,
    difficulty: "standard"
  }
];

export function getContent(id) {
  return CONTENTS.find((content) => content.id === id) || CONTENTS[0];
}

export function contentsForSubject(subject) {
  return CONTENTS.filter((content) => content.subject === subject);
}
