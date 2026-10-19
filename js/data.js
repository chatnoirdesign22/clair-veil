/* =========================================================
   clair veil — サイトのデータ（料金・メニューなど）
   料金や文章を変えたいときは、このファイルだけ直せばOKです
   ========================================================= */
window.CV = window.CV || {};

/* 髪の長さ */
CV.lengths = [
  { id: "short",  name: "ショート",   desc: "あご〜肩上" },
  { id: "medium", name: "ミディアム", desc: "肩〜鎖骨" },
  { id: "long",   name: "ロング",     desc: "鎖骨より下" }
];

/* メニュー
   price: 長さごとの料金（一律のものは同じ数字）
   time : 長さごとの所要時間（分）
   excludes: 同時に選べないメニュー
   swap: true なら、相手を選ぶと入れ替わる／なければ相手は選べなくなる（理由は excludeNote） */
CV.menus = [
  {
    id: "cut", name: "カット",
    desc: "シャンプー・ブロー込み。骨格や髪のクセに合わせてデザインします",
    price: { short: 5500, medium: 5500, long: 5500 },
    time:  { short: 60, medium: 60, long: 60 },
    excludes: ["bangs"], excludeNote: "前髪カットはカットに含まれます"
  },
  {
    id: "bangs", name: "前髪カット",
    desc: "前髪だけを整えます（約15分）",
    price: { short: 1100, medium: 1100, long: 1100 },
    time:  { short: 15, medium: 15, long: 15 },
    excludes: ["cut"], swap: true
  },
  {
    id: "color", name: "カラー",
    desc: "透明感のある髪色に。ブリーチなしで柔らかく発色させます",
    price: { short: 7700, medium: 8800, long: 9900 },
    time:  { short: 90, medium: 90, long: 105 },
    excludes: ["bleach"], swap: true
  },
  {
    id: "bleach", name: "ケアブリーチ",
    desc: "髪へのダメージを抑えたブリーチ。明るい・淡い色にしたい方向け（その後のカラー代込み）",
    price: { short: 13200, medium: 14300, long: 16500 },
    time:  { short: 120, medium: 120, long: 135 },
    excludes: ["color"], swap: true
  },
  {
    id: "treatment", name: "髪質改善トリートメント",
    desc: "髪の内側まで補修して、広がり・パサつきを抑えツヤを出すトリートメント",
    price: { short: 8800, medium: 9900, long: 11000 },
    time:  { short: 60, medium: 60, long: 75 },
    excludes: []
  },
  {
    id: "spa", name: "ヘッドスパ",
    desc: "頭皮の汚れを落としながらマッサージ。リラックスと髪の土台づくりに",
    price: { short: 3300, medium: 3300, long: 3300 },
    time:  { short: 20, medium: 20, long: 20 },
    excludes: []
  }
];

/* セット割引
   when: 選んだメニューIDの一覧を受け取り、当てはまれば true */
CV.discounts = [
  {
    id: "cutcolor", name: "カット＋カラー割", amount: 1100,
    when: (ids) => ids.includes("cut") && (ids.includes("color") || ids.includes("bleach"))
  },
  {
    id: "care", name: "ケアセット割", amount: 550,
    when: (ids) => ids.includes("cut") && (ids.includes("color") || ids.includes("bleach")) &&
                   (ids.includes("treatment") || ids.includes("spa"))
  }
];

/* 店舗情報（すべて架空） */
CV.shop = {
  name: "clair veil",
  kana: "クレール ヴェール",
  address: "大阪市北区茶屋町99-9 ヴェールビル 3F",
  access: "阪急 大阪梅田駅 茶屋町口から徒歩6分",
  hours: "10:00〜20:00（最終受付 18:30）",
  holiday: "火曜日",
  seats: "4席",
  tel: "000-0000-0000"
};

/* スタッフ（すべて架空の人物） */
CV.staff = [
  {
    id: "mio", name: "白石 澪", kana: "Shiraishi Mio", role: "店長／トップスタイリスト",
    photo: "images/staff-1.jpg", career: "美容師歴12年。都内の人気サロンで店長を務めたのち、clair veil をオープン。",
    good: ["骨格に合わせたカット", "顔まわりのデザイン", "大人っぽいレイヤー"],
    message: "「なりたい」を一緒に言葉にするところから始めます。言葉にできなくても大丈夫。写真1枚からでもご相談ください。"
  },
  {
    id: "akari", name: "朝倉 灯", kana: "Asakura Akari", role: "カラーリスト",
    photo: "images/staff-2.jpg", career: "美容師歴8年。カラー講習の講師も担当。透明感カラーを追求し続けるカラー専任。",
    good: ["透明感カラー", "ケアブリーチ", "ハイトーン・ペールカラー"],
    message: "光に透ける色を、できるだけ髪にやさしく。色落ちまで楽しめる色をご提案します。"
  },
  {
    id: "rin", name: "佐伯 凛", kana: "Saeki Rin", role: "スタイリスト",
    photo: "images/staff-3.jpg", career: "美容師歴5年。ソウルのサロン研修を経て、韓国風スタイルを得意とする。",
    good: ["韓国風レイヤーカット", "前髪カット", "ショート・ボブ"],
    message: "前髪1cmで印象はがらっと変わります。毎日のスタイリングが楽になるカットを心がけています。"
  },
  {
    id: "yui", name: "小野 結衣", kana: "Ono Yui", role: "アシスタント",
    photo: "images/staff-4.jpg", career: "美容師歴2年。ヘッドスパの資格を持ち、シャンプー・ケアを担当。",
    good: ["ヘッドスパ", "髪質改善トリートメント", "ホームケアのアドバイス"],
    message: "頭皮から整えて、ツヤの土台づくりを。施術中はゆっくりおくつろぎください。"
  }
];

/* スタイルギャラリー
   len: short / medium / long、tone: 下の CV.tones の id */
CV.tones = [
  { id: "beige",  name: "ベージュ系" },
  { id: "greige", name: "グレージュ系" },
  { id: "brown",  name: "ブラウン系" },
  { id: "pink",   name: "ピンク・ラベンダー系" }
];
CV.styles = [
  { id: 1,  img: "style-01", name: "グレージュのハンサムショート", len: "short", tone: "greige", staff: "rin", menus: ["cut", "color"], point: "えり足をすっきりさせ、トップに丸みを。くすみグレージュで抜け感を出しました。" },
  { id: 2,  img: "style-02", name: "ナチュラルブラウンの丸みボブ", len: "short", tone: "brown", staff: "rin", menus: ["cut"], point: "内側に自然に入る丸みボブ。乾かすだけでまとまるように重さを残しています。" },
  { id: 3,  img: "style-03", name: "ツヤ黒髪のミニショート", len: "short", tone: "brown", staff: "mio", menus: ["cut", "treatment"], point: "暗髪でも重く見えないよう、顔まわりに細かくレイヤーを入れています。" },
  { id: 4,  img: "style-04", name: "シースルー前髪のショートボブ", len: "short", tone: "brown", staff: "rin", menus: ["cut"], point: "すき間のあるシースルー前髪で、やわらかい印象に。" },
  { id: 5,  img: "style-05", name: "ぱっつん前髪のくびれボブ", len: "medium", tone: "brown", staff: "rin", menus: ["cut"], point: "首元でくびれをつくり、毛先は外へ。ぱっつん前髪で今っぽい雰囲気に。" },
  { id: 6,  img: "style-06", name: "韓国風ヨシンモリ・ミディ", len: "medium", tone: "brown", staff: "rin", menus: ["cut", "treatment"], point: "顔まわりの大きなカールが特徴の韓国風スタイル。レイヤーで巻きやすくしています。" },
  { id: 7,  img: "style-07", name: "ショコラブラウンのレイヤーミディ", len: "medium", tone: "brown", staff: "mio", menus: ["cut", "color"], point: "赤みをおさえたショコラブラウン。暗めでも光に当たると透けて見えます。" },
  { id: 8,  img: "style-08", name: "スモーキーグレージュの外ハネミディ", len: "medium", tone: "greige", staff: "akari", menus: ["cut", "color"], point: "ブリーチなしで黄みをおさえたグレージュ。外ハネで軽やかに。" },
  { id: 9,  img: "style-09", name: "ラベンダーピンクのゆるウェーブ", len: "medium", tone: "pink", staff: "akari", menus: ["bleach", "treatment"], point: "ケアブリーチ後にラベンダーとピンクを重ねたデザインカラー。色落ちも淡くかわいく。" },
  { id: 10, img: "style-10", name: "ピンクラベンダーのグラデーション", len: "long", tone: "pink", staff: "akari", menus: ["bleach", "treatment"], point: "毛先にかけてピンクラベンダーへ。伸びても気になりにくいデザインです。" },
  { id: 11, img: "style-11", name: "ミルクティーベージュのロングレイヤー", len: "long", tone: "beige", staff: "mio", menus: ["cut", "color"], point: "ミルクティーベージュ×ロングレイヤー。動くたびに毛先が軽く揺れます。" },
  { id: 12, img: "style-12", name: "ハイトーンベージュの巻きロング", len: "long", tone: "beige", staff: "akari", menus: ["bleach", "treatment"], point: "ケアブリーチで明るさを出し、黄みをおさえたベージュに。巻くとツヤが際立ちます。" },
  { id: 13, img: "style-13", name: "シルバーグレージュのストレートロング", len: "long", tone: "greige", staff: "akari", menus: ["bleach", "treatment"], point: "透けるようなシルバーグレージュ。髪質改善トリートメントでまっすぐなツヤを。" },
  { id: 14, img: "style-14", name: "ホワイトベージュの透けロング", len: "long", tone: "beige", staff: "akari", menus: ["bleach", "treatment"], point: "淡いホワイトベージュで、光をまとうような髪色に。紫シャンプーで色持ちアップ。" },
  { id: 15, img: "style-15", name: "アッシュブロンドのくびれロング", len: "long", tone: "greige", staff: "mio", menus: ["cut", "bleach"], point: "胸下でくびれをつくったロング。アッシュブロンドで外国人風の透明感に。" },
  { id: 16, img: "style-16", name: "ピンクベージュのハイトーン", len: "medium", tone: "pink", staff: "akari", menus: ["bleach"], point: "ピンクとベージュを混ぜた甘すぎないハイトーン。色落ちするとやわらかなベージュに。" },
  { id: 17, img: "style-17", name: "暗髪ブラウンの顔まわりレイヤー", len: "long", tone: "brown", staff: "rin", menus: ["cut", "color"], point: "職場でも安心の暗めブラウン。顔まわりのレイヤーで小顔に見せます。" }
];
/* トップページの「おすすめスタイル」に出すID */
CV.pickup = [11, 8, 2, 10];

/* カラーシミュレーター */
CV.colors = [
  { id: "milktea",  name: "ミルクティーベージュ", hex: "#b4977c", bleach: false, keep: "約4〜6週間", menus: ["color", "treatment"], text: "黄みと赤みをおさえた、やわらかいベージュ。一番人気の定番カラーです。" },
  { id: "lavender", name: "ラベンダーグレージュ", hex: "#94879a", bleach: false, keep: "約4週間",   menus: ["color", "treatment"], text: "ほんのり紫を混ぜたグレージュ。肌が明るく見えます。" },
  { id: "olive",    name: "オリーブベージュ",     hex: "#978e6c", bleach: false, keep: "約5〜6週間", menus: ["color"], text: "赤みが出やすい髪でも、緑みでおさえて透明感を出せる色です。" },
  { id: "pinkbr",   name: "ピンクブラウン",       hex: "#a0756c", bleach: false, keep: "約4〜5週間", menus: ["color", "treatment"], text: "血色感が出るやさしいピンク系ブラウン。暗めでもかわいい印象に。" },
  { id: "choco",    name: "ショコラブラウン",     hex: "#5f4538", bleach: false, keep: "約6〜8週間", menus: ["color"], text: "落ち着いた暗めブラウン。ツヤが出やすく、色持ちも良い色です。" },
  { id: "silver",   name: "シルバーグレージュ",   hex: "#b3aea8", bleach: true,  keep: "約3〜4週間", menus: ["bleach", "treatment"], text: "透けるような淡いグレー。ケアブリーチで黄みを抜いてから重ねます。" },
  { id: "white",    name: "ホワイトベージュ",     hex: "#dccab1", bleach: true,  keep: "約3週間",   menus: ["bleach", "treatment"], text: "光をまとうような、白に近いベージュ。ブリーチ2回程度が目安です。" },
  { id: "cherry",   name: "チェリーピンク",       hex: "#c47f8c", bleach: true,  keep: "約2〜3週間", menus: ["bleach", "treatment"], text: "華やかなピンク。色落ちの途中もピンクベージュで楽しめます。" }
];

/* 来店前チャット相談（すべて事前に用意した文章です。AIは使っていません） */
CV.chat = {
  staff: "mio",
  greeting: [
    "こんにちは！clair veil 店長の白石です。",
    "ご来店前に、髪のお悩みをお聞かせください。ボタンを選ぶだけで、おすすめのメニューをご提案します。"
  ],
  askConcern: "いちばん気になっているお悩みはどれですか？",
  askLength: "今の髪の長さを教えてください。",
  concerns: [
    {
      id: "frizz", label: "広がる・うねる",
      q: "うねりや広がりは、いつ頃から気になっていますか？",
      options: [
        { label: "昔から（生まれつきのクセ）", reply: "生まれつきのクセは、髪の内側の水分バランスが偏っていることが多いんです。" },
        { label: "最近・雨の日に特に", reply: "湿気で広がるのは、ダメージで髪が水分を吸いやすくなっているサインかもしれません。" }
      ],
      advice: [
        "広がりは「髪の内側のスカスカ」と「毛量のバランス」の2つが原因になりやすいです。",
        "髪質改善トリートメントで内側を補修しつつ、カットで膨らみやすい部分の量を整えると、乾かすだけでまとまりやすくなりますよ。"
      ],
      menus: ["cut", "treatment"]
    },
    {
      id: "damage", label: "ダメージ・パサつき",
      q: "最後にカラーやブリーチをしたのはいつ頃ですか？",
      options: [
        { label: "1か月以内", reply: "直近で施術されているので、今回はケアを中心に考えましょう。" },
        { label: "2〜3か月前", reply: "時間が経っていても、毛先にはダメージが残っていることが多いです。" },
        { label: "ブリーチをしたことがある", reply: "ブリーチをした髪はとても繊細なので、しっかり補修してあげたいですね。" }
      ],
      advice: [
        "パサつきは、髪の表面を守るキューティクル（うろこ状の膜）がはがれて、水分が逃げやすくなっている状態です。",
        "傷んだ毛先を少しカットして、髪質改善トリートメントで内側から補修するのがおすすめです。ヘッドスパで頭皮を整えると、これから生える髪も健やかになります。"
      ],
      menus: ["cut", "treatment", "spa"]
    },
    {
      id: "fade", label: "カラーの色落ちが早い",
      q: "普段はどんな明るさのカラーをしていますか？",
      options: [
        { label: "明るめ（ハイトーン）", reply: "明るい色ほど色の粒が抜けやすいので、色落ちを感じやすいんです。" },
        { label: "暗め〜ふつう", reply: "暗めでも色落ちが早いなら、髪のダメージが原因かもしれません。" }
      ],
      advice: [
        "色落ちの原因は、ダメージで髪が色素をとどめておけないことが多いです。熱いお湯でのシャンプーも色落ちを早めます。",
        "カラーと一緒に髪質改善トリートメントをすると、色素が髪にとどまりやすくなります。ご自宅ではぬるめのお湯で洗うのがおすすめです。"
      ],
      menus: ["color", "treatment"]
    },
    {
      id: "style", label: "似合う髪型がわからない",
      q: "なりたい雰囲気に近いのはどれですか？",
      options: [
        { label: "やわらかい・かわいい", reply: "やわらかい印象なら、丸みのあるシルエットと前髪がポイントです。" },
        { label: "大人っぽい・クール", reply: "大人っぽさは、縦のラインを強調するレイヤーで作りやすいです。" },
        { label: "今っぽく垢抜けたい", reply: "垢抜けには、顔まわりのデザインと髪色の透明感が効果的です。" }
      ],
      advice: [
        "似合う髪型は、骨格・髪質・普段のスタイリング時間の3つで決まります。",
        "カウンセリングでお顔の形や髪のクセを見ながら、ギャラリーの写真も使って一緒に決めましょう。顔まわりが明るく見えるカラーを合わせるのもおすすめです。"
      ],
      menus: ["cut", "color"]
    },
    {
      id: "bleach", label: "ブリーチに挑戦したい",
      q: "ブリーチは初めてですか？",
      options: [
        { label: "初めて", reply: "初めてのブリーチ、ドキドキしますよね。ダメージを抑える方法でご案内します。" },
        { label: "したことがある", reply: "前回ブリーチした部分の状態を見ながら、重ならないように塗り分けますね。" }
      ],
      advice: [
        "当店のケアブリーチは、薬剤に髪を守る成分を混ぜて、ダメージをできるだけ抑えるブリーチです。",
        "ブリーチ後は髪が乾燥しやすいので、髪質改善トリートメントを一緒にするのがおすすめ。カットで傷みやすい毛先を整えると、色もきれいに見えます。"
      ],
      menus: ["cut", "bleach", "treatment"]
    }
  ],
  closing: "ご予約の際は、チャットで選んだ内容をそのままお伝えいただければスムーズです。お会いできるのを楽しみにしています！"
};
