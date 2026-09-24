const IMAGES = {
 tanker: "https://images.unsplash.com/photo-1530890448995-4d82724f702c?auto=format&fit=crop&w=1600&q=82",
 eu: "https://www.worldatlas.com/r/w1200-q80/upload/b8/99/ca/european-commission-european-union-belgium.jpg",
 canal: "https://media.egyin.com/ArticleUpload/2025/3/3/776c4d92-3199-4e64-b_1787_075516.jpg",
 brics: "https://www.financialmail.businessday.co.za/resizer/v2/VYSCC7UCRJP3DIBZZSZVMO4JWQ.jpg?auth=e656daf8936115ebca14aecf1ec7e0fc77a3b2ac9e4ef03005af6c6277dc1958&height=630&smart=true&width=1200",
 space: "https://assets.science.nasa.gov/dynamicimage/assets/science/missions/aqua/aqua_mission_banner.jpg?crop=faces%2Cfocalpoint&fit=crop&h=1125&w=2000",
 canada: "https://tradeisds.com/wp-content/uploads/shutterstock_508572865-2-scaled.jpg",
 bank: "https://usconstitution.net/media/images/federal-reserve-eccles-building-washington-dc_e5353c.jpg",
 storm: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1600&q=82",
 cinema: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=82",
 creator: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=82"
};

const episodes = [
{
 no:1,date:"2026.09.08",category:"中東・地政学",image:IMAGES.tanker,imageAlt:"夕景の港に停泊する大型船",credit:"テーマイメージ / Unsplash",
 title:"ホルムズ海峡は「閉じる武器」ではなく「閉じられると思わせる武器」なのか",
 summary:"米・イラン対立を起点に、ホルムズ海峡、石油、抑止、戦争目的の拡大、そして世界経済への波及を考えた最初の討論。",
 takeaway:"ニュースは「今日どこが攻撃されたか」だけでなく、「昨日まで当然だった仕組みの何が壊れ始めているか」を見る。",
 dialogue:[
 ["奏汰","イランだって石油を輸出したいのに、本当に海峡を止めたら自分も困るよね？"],
 ["日向","だから価値があるのは完全封鎖より、『いつでも世界経済を痛められる』と相手に思わせることなんだ。"],
 ["奏汰","核兵器と似てる？"],
 ["日向","かなり似ている。強力な手段ほど、実際に使うより『使える』と信じさせることで力を持つ。"],
 ["奏汰","じゃあアメリカが軍事的に圧倒すれば終わる？"],
 ["日向","戦闘に勝つことと、問題を解決することは別だ。政権や社会まで含めると、軍事力だけでは終了条件を作れない。"],
 ["奏汰","戦争の目的が増えると終わりにくくなる？"],
 ["日向","そう。核、ミサイル、石油輸出、海峡、政権……目的が増えるほど『何を達成したら終わりか』が曖昧になる。"]
]},
{
 no:2,date:"2026.09.09",category:"欧州・安全保障",image:IMAGES.eu,imageAlt:"欧州連合の旗",credit:"テーマイメージ",
 title:"和平交渉の直後に攻撃する――戦争を終わらせたいのに、なぜ攻撃は激しくなるのか",
 summary:"ロシアとウクライナの和平交渉を題材に、交渉直前の軍事行動、継戦能力、欧米支援、そして『停戦』と『和平』の違いを議論。",
 takeaway:"戦争を止める和平と、戦争を終わらせる和平は同じではない。",
 dialogue:[
 ["奏汰","和平交渉した直後に攻撃するなら、和平する気がないってことじゃない？"],
 ["日向","逆に、交渉が始まったから攻撃を強めることもある。交渉は『戦争で作った現状をどこまで認めさせるか』の場でもあるからね。"],
 ["奏汰","土地を取ってから話した方が得？"],
 ["日向","土地だけではない。電力、港、鉄道、都市、経済、心理を削って、国家の継戦能力を落とすことも交渉力になる。"],
 ["奏汰","ロシアとウクライナ、どっちが勝ってるの？"],
 ["日向","その問いが難しい時点で長期戦だ。『誰が勝つか』より『誰が先に耐えられなくなるか』へ変わっている。"],
 ["奏汰","ウクライナだけの耐久力じゃないよね？"],
 ["日向","そう。実際はウクライナ＋欧米の支援意思まで含む。戦場だけでなく、ワシントンやベルリンの政治も戦争の一部になる。"]
]},
{
 no:3,date:"2026.09.10",category:"中東・経済",image:IMAGES.tanker,imageAlt:"大型船と夕焼け",credit:"テーマイメージ / Unsplash",
 title:"タンカーまで戦場になったとき、戦争は世界経済そのものを攻撃する",
 summary:"商船への攻撃と原油高を軸に、ホルムズ海峡が軍事・保険・物流・世論を一つの戦場へ接続する仕組みを整理。",
 takeaway:"現代の戦争では、ミサイルが届かなくても値札が届く。",
 dialogue:[
 ["奏汰","アメリカとイランが戦ってるのに、どうして関係ない国のタンカーまで危なくなるの？"],
 ["日向","商船が危なくなると、戦争は二国間から『世界中にコストを払わせる戦略』へ変わる。"],
 ["奏汰","完全封鎖しなくてもいい？"],
 ["日向","必要ない。保険料が上がり、船会社が避け、輸送費が上がれば市場は反応する。"],
 ["奏汰","護衛艦を増やせば？"],
 ["日向","『だいたい安全』では足りない。市場が必要とするのは予測可能性だ。たった一件の炎上映像でも価格は動く。"],
 ["奏汰","じゃあ経済も戦場？"],
 ["日向","軍事、金融、物流、エネルギー、保険、サプライチェーン、世論。全部が戦場になる。"]
]},
{
 no:4,date:"2026.09.11",category:"中東・物流",image:IMAGES.canal,imageAlt:"運河を航行するコンテナ船",credit:"テーマイメージ",
 title:"ホルムズだけでなく紅海まで――世界経済はなぜ細い海峡に依存しているのか",
 summary:"バブ・エル・マンデブ海峡と紅海情勢から、世界経済の『チョークポイント』と効率性・レジリエンスのトレードオフを考察。",
 takeaway:"巨大なシステムほど、意外に少数の『細い場所』へ依存している。",
 dialogue:[
 ["奏汰","また海峡？世界ってそんなに細い場所ばかりなの？"],
 ["日向","物流は海上輸送に最適化されてきた。その結果、スエズ、ホルムズ、マラッカのような地点に流れが集中した。"],
 ["奏汰","もっといろんな道を作ればいいのに。"],
 ["日向","冗長化にはお金がかかる。平和な時代ほど『そんな予備はいらない』と削られていく。"],
 ["奏汰","コロナのマスクや半導体不足と同じ？"],
 ["日向","同じ構造だ。在庫を減らし、供給元を集約すると平時は効率的。でも危機には弱い。"],
 ["奏汰","小さな勢力でも海峡を押さえれば大国に影響できる？"],
 ["日向","そう。国力は領土や戦車だけではない。『世界が依存している場所を握ること』も力になる。"]
]},
{
 no:5,date:"2026.09.12",category:"経済・レジリエンス",image:IMAGES.canal,imageAlt:"海上輸送を担う大型船",credit:"テーマイメージ",
 title:"主要ルートだけでなく逃げ道まで壊れる――世界は効率を捨てて冗長化へ進むのか",
 summary:"代替パイプラインやLNG調達を手がかりに、危機の時代に企業と国家が『余計なコスト』を再評価する流れを議論。",
 takeaway:"平和な時代は効率が強さ。危機の時代は、余裕が強さになる。",
 dialogue:[
 ["奏汰","ホルムズが危ないからパイプラインを使う。パイプラインも危ない。次は？"],
 ["日向","それが今日の問題だ。通常経路Aが落ちてBへ切り替えたのに、Bまで落ちる。ならCが必要になる。"],
 ["奏汰","でもCは普段使わないなら無駄じゃない？"],
 ["日向","その『無駄』がレジリエンスだ。効率性は設備・在庫・供給者を減らす。レジリエンスは逆に余分を持つ。"],
 ["奏汰","結局、全部高くならない？"],
 ["日向","なる。これから商品価格には『安全保障代』が含まれる可能性がある。"],
 ["奏汰","ちょっと高くなる代わりに壊れにくくする？"],
 ["日向","そう。最も安いシステムから、壊れても動き続けるシステムへ。"]
]},
{
 no:6,date:"2026.09.13",category:"国際秩序",image:IMAGES.brics,imageAlt:"BRICS参加国の旗",credit:"テーマイメージ",
 title:"BRICSは反米同盟なのか――それとも『陣営を選ばない』国々のネットワークなのか",
 summary:"BRICSを冷戦型の二陣営論から切り離し、戦略的自律・脱ドル・中堅国の選択肢という視点で再整理。",
 takeaway:"21世紀の国力は『どちら側か』だけでなく、『いくつ選択肢を持てるか』で測られる。",
 dialogue:[
 ["奏汰","BRICSって『アメリカ嫌いな国の集まり』なの？"],
 ["日向","それでは説明できない。インドやUAEのように米国とも深く関係する国がいる。"],
 ["奏汰","じゃあ何の集まり？"],
 ["日向","『アメリカ中心の世界だけに依存したくない国々』と見る方が近い。"],
 ["奏汰","仲が悪い国同士もいるよね？"],
 ["日向","だからこそ軍事同盟ではなく緩い枠組みだ。結束が弱いから大きくなれる。"],
 ["奏汰","脱ドルって、ドルが突然終わるの？"],
 ["日向","そんな革命ではない。自国通貨決済などで依存が少しずつ減る『侵食』として見るべきだ。"]
]},
{
 no:7,date:"2026.09.14",category:"欧州・経済戦争",image:IMAGES.tanker,imageAlt:"エネルギー輸送を担う大型船",credit:"テーマイメージ / Unsplash",
 title:"敵の製油所を壊すと味方の生活費も上がる――経済戦争に『敵だけを傷つけるボタン』はない",
 summary:"ウクライナによるロシア製油施設への攻撃を題材に、軍事合理性、国際人道法、同盟国の利害、世界市場の連鎖を検討。",
 takeaway:"攻撃を見るときは『何を破壊できるか』だけでなく、『その破壊によって誰まで困るか』を見る。",
 dialogue:[
 ["奏汰","ロシア軍も燃料を使う。製油所を攻撃するのは合理的じゃない？"],
 ["日向","軍事的には合理性がある場合がある。でも軍事的合理性と国際法上の合法性は同じではない。"],
 ["奏汰","民間施設でも軍に燃料を送っていたら？"],
 ["日向","軍事目標になり得るが、軍事的利益と民間被害を個別に評価する必要がある。"],
 ["奏汰","でも世界の燃料価格まで上がる。"],
 ["日向","市場は攻撃の正義を判定しない。供給が減れば価格が上がる。"],
 ["奏汰","同盟国でも利益は違う？"],
 ["日向","そう。ウクライナの最善と、米国の消費者にとっての最善は一致しないことがある。"]
]},
{
 no:8,date:"2026.09.15",category:"核・安全保障",image:IMAGES.eu,imageAlt:"欧州連合の旗と欧州機関の建物",credit:"テーマイメージ",
 title:"欧州は『アメリカなしの核抑止』を考え始めるのか",
 summary:"フランスの核抑止と欧州安全保障を題材に、拡大抑止、信頼性、安全保障のジレンマ、核拡散リスクを議論。",
 takeaway:"抑止は兵器の数だけではなく、『本当に使うかもしれない』と相手に信じさせられるかで成立する。",
 dialogue:[
 ["奏汰","NATOに入っているならアメリカの核で守られるんじゃない？"],
 ["日向","現在はそう。ただ核抑止では、『アメリカは本当に自国都市への報復リスクを負ってまで欧州を守るか』という信頼性が常に問われる。"],
 ["奏汰","核兵器って、使う武器じゃなくて信じさせる武器？"],
 ["日向","その表現は核心に近い。抑止では能力と同時にcredibilityが必要だ。"],
 ["奏汰","フランスの核を使うかはフランス大統領が決めるんだよね。"],
 ["日向","そう。だからアメリカの問題をフランスに置き換えただけという弱点もある。"],
 ["奏汰","それでも意味がある？"],
 ["日向","100%の保証でなくても、介入可能性を増やせば相手の計算を複雑にできる。"]
]},
{
 no:9,date:"2026.09.16",category:"宇宙・安全保障",image:IMAGES.space,imageAlt:"地球を周回する人工衛星",credit:"テーマイメージ / NASA",
 title:"宇宙が戦場になるとき、最初に狙われるのは人工衛星かもしれない",
 summary:"対衛星能力と宇宙兵器を題材に、衛星依存社会、先制優位、誤認、宇宙ゴミ、民間インフラと軍事の境界を考察。",
 takeaway:"人類にとって難しいのは宇宙へ行くことより、地上で解決できなかった対立を宇宙まで持ち込まないこと。",
 dialogue:[
 ["奏汰","宇宙条約があるなら、宇宙に武器を置くのは禁止じゃないの？"],
 ["日向","核など大量破壊兵器には明確な禁止があるが、すべての宇宙兵器を全面禁止する仕組みではない。"],
 ["奏汰","人工衛星を壊す意味ってそんなに大きい？"],
 ["日向","通信、測位、偵察、気象、金融の時刻同期。衛星は現代社会と軍隊の目・耳・神経だ。"],
 ["奏汰","戦争になったら先に衛星を壊した方が得？"],
 ["日向","それが危険なんだ。先制優位が強いと、戦争が始まる前に攻撃する誘惑が生まれる。"],
 ["奏汰","宇宙で衛星を壊すとゴミも残る。"],
 ["日向","破片は地球を回り続け、第三国の衛星にも被害を与え得る。戦争が終わっても弾丸だけが飛び続ける。"]
]},
{
 no:10,date:"2026.09.17",category:"国際秩序",image:IMAGES.canada,imageAlt:"カナダと欧州連合の旗",credit:"テーマイメージ",
 title:"カナダがEUへ近づく意味――『一つの大国に依存しない外交』は西側にも広がるのか",
 summary:"カナダとEUの接近を題材に、米国依存、重要鉱物、北極圏、外交の冗長化、同盟構造のメッシュ化を議論。",
 takeaway:"21世紀では『どの陣営に所属するか』より、『いくつの陣営と接続できるか』が国力になるかもしれない。",
 dialogue:[
 ["奏汰","カナダって北米なのに、なぜEUへ近づくの？"],
 ["日向","地理より、経済・安全保障・価値観のネットワークが重要になっているからだ。"],
 ["奏汰","アメリカと一緒にやれば一番近いのに。"],
 ["日向","近いからこそ依存も大きい。関係が悪化した時のSingle Point of Failureになる。"],
 ["奏汰","また冗長化？"],
 ["日向","そう。EU、アジア、他の市場へ接続を増やし、外交のマルチリージョン化を進める。"],
 ["奏汰","EU側にも得がある？"],
 ["日向","重要鉱物、エネルギー、北極圏、防衛産業。補完関係は多い。"]
]},
{
 no:11,date:"2026.09.18",category:"金融・世界経済",image:IMAGES.bank,imageAlt:"中央銀行の建物",credit:"テーマイメージ",
 title:"石油が高い。だから金利を上げる――それで石油は安くなるのか",
 summary:"エネルギー高と金融政策を起点に、供給ショック、インフレ期待、スタグフレーション、中央銀行の限界を議論。",
 takeaway:"中央銀行は戦争を終わらせられない。できるのは、供給ショックが持続的なインフレへ感染するのを抑えること。",
 dialogue:[
 ["奏汰","石油が高いから利上げする。でも金利を上げたら石油が出てくるの？"],
 ["日向","出てこない。中央銀行が直接直せるのは供給ではなく、需要と期待だ。"],
 ["奏汰","じゃあ意味がない？"],
 ["日向","石油高が賃金・価格設定・期待へ波及して、持続的なインフレになるのを防ぐ意味がある。"],
 ["奏汰","でも利上げすると住宅ローンも会社の借入も高くなる。"],
 ["日向","だから供給ショック時の金融政策は難しい。物価を抑える代わりに景気を傷める可能性がある。"],
 ["奏汰","スタグフレーション？"],
 ["日向","物価が高いのに景気が悪い状態だ。中央銀行にとって最も嫌な組み合わせの一つ。"],
 ["奏汰","世界のニュースって全部つながってる。"],
 ["日向","ホルムズ海峡→原油→インフレ→金利→ドル→円→輸入価格。国際ニュースは一本の線でつながっている。"]
]},
{
 no:12,date:"2026.09.19",category:"世界・経済制裁",image:IMAGES.brics,imageAlt:"複数国の旗と国際協議を想起させるイメージ",credit:"テーマイメージ",
 title:"ロシアを止めるために、インドと中国を罰する？――経済戦争のルールが変わるとき",
 summary:"対ロ制裁を第三国との貿易へ広げる発想から、二次制裁、市場アクセス、制裁の副作用、脱ドル化のインセンティブを議論。",
 takeaway:"強い経済制裁ほど相手の行動を変え得る一方、使い続ければ制裁が効きにくい代替ネットワークを作る動機にもなる。",
 dialogue:[
 ["奏汰","ロシアを止めたいのに、どうしてインドや中国まで巻き込むの？"],
 ["日向","ロシアと取引する第三国にもコストを負わせれば、ロシアへの資金流入そのものを減らせるという考え方だ。"],
 ["奏汰","命令するんじゃなくて、アメリカ市場とロシア取引のどちらを選ぶか迫る？"],
 ["日向","そう。市場アクセスそのものが外交の武器になる。"],
 ["奏汰","でも強く使いすぎると？"],
 ["日向","各国はドルや米国市場への依存を減らす仕組みを作ろうとする。制裁の強さが、長期的には制裁回避の技術を育てる可能性もある。"]
]},
{
 no:13,date:"2026.09.20",category:"世界・中東",image:IMAGES.tanker,imageAlt:"エネルギー輸送を担う大型船",credit:"テーマイメージ / Unsplash",
 title:"逃げ道まで塞がれたサウジ――産油国が「海に出られない」と何が起きる？",
 summary:"ホルムズ海峡、東西パイプライン、紅海を一つの輸送システムとして捉え、石油を持つことと世界へ届けることの違いを議論。",
 takeaway:"21世紀の資源国の強さは、油田の量だけでなく、その資源を安全に運び出せるネットワークの冗長性でも決まる。",
 dialogue:[
 ["奏汰","サウジって石油がたくさんあるのに、なんで供給不安になるの？"],
 ["日向","地下にあるだけでは市場へ届かない。掘って、運んで、港へ出して、タンカーで届けるまで全部が供給なんだ。"],
 ["奏汰","ホルムズがメイン回線で、東西パイプラインがバックアップ？"],
 ["日向","その理解でいい。問題は、複数の経路が同時に不安定になると冗長化そのものが崩れることだ。"],
 ["奏汰","小さい勢力でも大国を困らせられる？"],
 ["日向","大国そのものを倒さなくても、システムが依存している少数のノードを狙えば大きな影響を与えられる。"]
]},
{
 no:14,date:"2026.09.21",category:"世界・国際秩序",image:IMAGES.eu,imageAlt:"国際機関と多国間外交を想起させる旗",credit:"テーマイメージ",
 title:"国連って、まだ必要なの？――80年前の世界OSは2026年にも動くのか",
 summary:"国連総会をきっかけに、安全保障理事会の拒否権、多国間外交、BRICSなど新しい枠組み、AI時代の国際協調を議論。",
 takeaway:"国連の価値は世界政府になることではなく、対立する国々が完全に切断されない共通基盤を保つことにある。",
 dialogue:[
 ["奏汰","戦争を止められないなら、国連って何のためにあるの？"],
 ["日向","国連は世界政府ではない。大国を含めたほぼ全世界が同じ制度の中で交渉できる場所であること自体に価値がある。"],
 ["奏汰","でも拒否権で動けなくなる。"],
 ["日向","それは欠陥でもあり、1945年に大国を制度内へ残すための設計でもある。"],
 ["奏汰","今の世界と1945年は違うよ。"],
 ["日向","だからこそ、国連だけでなくG20やBRICSなど複数の枠組みを使い分ける『マルチシステム化』が進んでいる。"]
]},
{
 no:15,date:"2026.09.21",category:"国内・防災",image:IMAGES.storm,imageAlt:"激しい風雨を伴う嵐",credit:"テーマイメージ / Unsplash",
 title:"台風で交通が止まるのは弱さなのか――首都圏を守る「安全に止める」発想",
 summary:"台風25号による交通影響を題材に、計画運休、都市インフラの依存関係、停止と復旧を前提にしたレジリエンスを議論。",
 takeaway:"強い都市とは絶対に止まらない都市ではなく、安全に止まり、被害を局所化し、早く再起動できる都市かもしれない。",
 dialogue:[
 ["奏汰","日本って台風に慣れてるのに、なんで電車が止まるの？"],
 ["日向","止まってしまったのではなく、危険になる前に止められるようになった、と見ることもできる。"],
 ["奏汰","サーバーを壊れるまで動かさず、安全にshutdownする感じ？"],
 ["日向","かなり近い。問題は鉄道だけでなく、出勤、店舗、配送、空港へ障害が連鎖することだ。"],
 ["奏汰","何も起きなかったら対策が無駄に見えそう。"],
 ["日向","成功した防災ほど成果が見えにくい。それでも事前停止には大きな価値がある。"]
]},
{
 no:16,date:"2026.09.21",category:"エンタメ・映画",image:IMAGES.cinema,imageAlt:"映画館のスクリーンと客席",credit:"テーマイメージ / Unsplash",
 title:"『バイオハザード』はなぜ30年戦える？――ホラーと長寿IPの強さ",
 summary:"長寿ゲームIPの映画展開から、ホラーの低予算性、劇場体験、作家性とブランドの両立、IPを世代交代させる仕組みを議論。",
 takeaway:"現代エンタメ企業の競争は一発のヒットだけでなく、世界観を何十年も更新し続けられるかに移っている。",
 dialogue:[
 ["奏汰","30年前のゲームが、今も映画で人を呼べるの？"],
 ["日向","ゲーム、映画、リメイク、新作を循環させれば、古いIPでも新しい世代へ入り直せる。"],
 ["奏汰","ホラーは映画館と相性がいい？"],
 ["日向","大音響、暗闇、観客と一緒に驚く体験は家では再現しにくい。低予算でも劇場価値を作りやすい。"],
 ["奏汰","じゃあ映画館は映画じゃなくて体験を売ってる？"],
 ["日向","その見方は重要だ。配信時代ほど『劇場で見る理由』が作品の価値になる。"]
]},
{
 no:17,date:"2026.09.22",category:"世界・米中",image:IMAGES.brics,imageAlt:"大国間外交と国際交渉を想起させる旗",credit:"テーマイメージ",
 title:"米中対立は、なぜ完全には切れないのか",
 summary:"米中首脳外交を題材に、貿易・半導体・台湾・AIをめぐって競争と相互依存が同時に存在する構造を議論。",
 takeaway:"米中関係の現実的な目標は仲直りより、競争を事故や戦争へ変えないための管理ルールを作ることにある。",
 dialogue:[
 ["奏汰","ずっと仲が悪いなら、経済も全部別々にすればいいのに。"],
 ["日向","政治的には分離を掲げられても、工場、部品、物流、価格の依存関係は一晩では作り替えられない。"],
 ["奏汰","敵なのに商売してる？"],
 ["日向","安全保障では競争し、経済では取引し、事故防止では協力する。現代の大国関係は敵味方の二択ではない。"],
 ["奏汰","首脳会談で見るべきことは？"],
 ["日向","握手の写真より、台湾・半導体・AIなどで『ここから先は危険』という境界線を共有できるかだ。"]
]},
{
 no:18,date:"2026.09.22",category:"国内・防災",image:IMAGES.storm,imageAlt:"荒天と豪雨を表すイメージ",credit:"テーマイメージ / Unsplash",
 title:"想定外の豪雨が常態化したら、防災はどう変わる？",
 summary:"台風25号による被害を題材に、警報疲れ、土地利用、ハザードマップ、インフラ更新など『守り方』から『街の設計』への転換を議論。",
 takeaway:"災害が変わるなら、堤防を高くするだけでなく、どこに住み、何を守るのかという都市設計そのものも変える必要がある。",
 dialogue:[
 ["奏汰","計画運休しても、人が亡くなることはあるんだね。"],
 ["日向","鉄道は一括停止できても、住宅、道路、斜面、河川は同じようには制御できない。"],
 ["奏汰","警報を増やせばいい？"],
 ["日向","多すぎると『またか』という警報疲れも起こる。情報量だけでは解決しない。"],
 ["奏汰","じゃあ何を変える？"],
 ["日向","長期的には土地利用や住宅政策まで含めて、『どこを守るか』を考え直す必要がある。"]
]},
{
 no:19,date:"2026.09.22",category:"エンタメ・映画産業",image:IMAGES.cinema,imageAlt:"暗い映画館の客席",credit:"テーマイメージ / Unsplash",
 title:"「映画館は配信に負ける」は外れた？――劇場は何を売る場所になったのか",
 summary:"北米映画興行の回復を題材に、IMAXなどのプレミアム体験、配信との役割分担、中規模映画が抱える課題を議論。",
 takeaway:"映画館は映画そのものだけでなく、家では再現しにくい大画面・音響・共有体験を売る場所へ再定義されている。",
 dialogue:[
 ["奏汰","配信があるのに、映画館ってなくならなかったね。"],
 ["日向","映画だけなら家でも見られる。だから劇場は巨大スクリーンや音響など『家にない体験』を強く売るようになった。"],
 ["奏汰","配信と映画館は敵じゃない？"],
 ["日向","役割が分かれつつある。ただ、大作ばかりが劇場に残ると中規模作品が消えるリスクもある。"],
 ["奏汰","復活したというより変身した？"],
 ["日向","その表現が近い。技術革新は古い媒体を消すだけでなく、存在理由を問い直す。"]
]},
{
 no:20,date:"2026.09.23",category:"世界・中東外交",image:IMAGES.tanker,imageAlt:"ホルムズ海峡とエネルギー輸送を想起させる船",credit:"テーマイメージ / Unsplash",
 title:"ホルムズ海峡は「武器」から「交渉通貨」へ変わるのか",
 summary:"海峡再開を条件付きで交渉材料にする発想から、封鎖のコスト、抑止、交渉、和平への入口と圧力継続のリスクを議論。",
 takeaway:"強いカードは使い切るより、使える状態を保って交渉条件へ変換した方が大きな価値を持つことがある。",
 dialogue:[
 ["奏汰","一番強いカードなら、どうして海峡を開ける話をするの？"],
 ["日向","閉じ続ければ相手だけでなく自分の貿易も傷む。だから開閉そのものを交渉条件へ変える方が合理的な場合がある。"],
 ["奏汰","降参じゃなくて取引？"],
 ["日向","そう。『条件を満たせば開ける』なら、海峡は軍事手段から外交通貨へ変わる。"],
 ["奏汰","和平になる？"],
 ["日向","そこはまだ別問題だ。重要なのは、相手が提案を交渉の入口と見るか、さらに圧力をかける理由と見るかだ。"]
]},
{
 no:21,date:"2026.09.23",category:"国内・災害",image:IMAGES.storm,imageAlt:"豪雨と強風を表す嵐",credit:"テーマイメージ / Unsplash",
 title:"「想定外」が続く時代、防災は設備だけで足りるのか",
 summary:"台風被害をきっかけに、鉄道など管理可能なインフラと住宅・道路・斜面の違い、避難、警報、土地利用政策を議論。",
 takeaway:"防災は強い設備を作るだけでなく、危険が増えた場所でどこまで生活や都市機能を維持するかという社会設計でもある。",
 dialogue:[
 ["奏汰","防災設備があっても、被害をゼロにはできないんだね。"],
 ["日向","そう。特に住宅や道路は鉄道のように一括停止できない。だから避難や土地利用が重要になる。"],
 ["奏汰","警報があれば逃げられる？"],
 ["日向","警報疲れや正常性バイアスもある。情報を出すだけでなく、行動へつなげる設計が必要だ。"],
 ["奏汰","街の場所そのものを変える話にもなる？"],
 ["日向","長期的にはそう。災害リスクが変われば、都市計画も更新しなければならない。"]
]},
{
 no:22,date:"2026.09.23",category:"エンタメ・配信",image:IMAGES.cinema,imageAlt:"映画館と映像コンテンツを表すイメージ",credit:"テーマイメージ / Unsplash",
 title:"大ヒット映画をすぐ配信へ――Disneyは何を売っているのか",
 summary:"『トイ・ストーリー』級の長寿IPを題材に、劇場興行、配信加入、商品、テーマパークへ収益を連鎖させるIP経済を議論。",
 takeaway:"現代エンタメで最も価値が高いのは一本の作品だけでなく、世代を越えて何度も価値を生む世界観とキャラクターである。",
 dialogue:[
 ["奏汰","映画館で大ヒットしたなら、ずっと上映した方が儲かるんじゃない？"],
 ["日向","映画会社にとって作品は劇場だけの商品ではない。配信加入、グッズ、次回作へ価値を移せる。"],
 ["奏汰","同じ作品を何回も売る？"],
 ["日向","正確にはIP全体で収益を最大化する。劇場はイベント、配信は長期接触の場所になる。"],
 ["奏汰","一発のヒットより長く育つ世界が強い？"],
 ["日向","その通り。世代をまたいで更新できるIPは企業にとって非常に大きな資産になる。"]
]},
{
 no:23,date:"2026.09.24",category:"世界・米中",image:IMAGES.brics,imageAlt:"国際外交と大国間協議を表す旗",credit:"テーマイメージ",
 title:"米中は敵なのに、なぜ離れられない？――競争を壊さず管理する時代",
 summary:"米中首脳会談を軸に、貿易、先端技術、台湾、AIをめぐる対立と相互依存、危機管理ルールの必要性を議論。",
 takeaway:"米中関係の成功条件は対立を消すことではなく、競争を続けながら偶発的な衝突や制御不能なエスカレーションを防ぐことにある。",
 dialogue:[
 ["奏汰","中国製品を減らしたいのに、どうして簡単に切れないの？"],
 ["日向","サプライチェーンは政治宣言だけでは動かない。工場、部品、物流、価格のつながりを作り直すには時間がかかる。"],
 ["奏汰","敵なのに協力もする？"],
 ["日向","安全保障では競争し、貿易では取引し、AIや軍事事故の回避では協調する理由がある。"],
 ["奏汰","じゃあ会談の成功って何？"],
 ["日向","仲直りより、双方が越えてはいけない境界線を理解して、競争を戦争へ変えないことだ。"]
]},
{
 no:24,date:"2026.09.24",category:"国内・金融",image:IMAGES.bank,imageAlt:"中央銀行を表す建築物",credit:"テーマイメージ",
 title:"「金利がある日本」が戻ってきた――家計・企業・政府は何が変わる？",
 summary:"日本の金利上昇を題材に、住宅ローン、預金、企業融資、為替、政府債務まで、ゼロ金利前提からの転換を議論。",
 takeaway:"重要なのは一度の利上げ幅ではなく、30年間低金利を前提に最適化されてきた日本社会が、金利のある世界へ適応できるかである。",
 dialogue:[
 ["奏汰","金利が1%台って、世界ではそんなに高くないんでしょ？"],
 ["日向","そう。でも日本では長くほぼゼロだったから、住宅ローン、企業融資、国債、預金の前提が変わる。"],
 ["奏汰","利上げすれば必ず円高？"],
 ["日向","為替は日米金利差、財政政策、景気期待など複数の要因で動く。単純な一対一対応ではない。"],
 ["奏汰","誰が一番影響を受ける？"],
 ["日向","変動型ローンの借り手、借入の多い企業、そして巨大な債務を持つ政府だ。一方で預金者には追い風になる。"]
]},
{
 no:25,date:"2026.09.24",category:"エンタメ・クリエイター",image:IMAGES.creator,imageAlt:"映像制作とクリエイター活動を表すカメラ",credit:"テーマイメージ / Unsplash",
 title:"YouTubeが「編集者」をAI化――上手い動画が無限に作れる時代、何が価値になる？",
 summary:"AIによるサムネイル、編集案、制作支援を題材に、クリエイター経済、最適化の均質化、制作技術より『何を語るか』が希少になる未来を議論。",
 takeaway:"制作技術がAIでコモディティ化するほど、その人だけが持つ視点、経験、題材、人格がクリエイターの差別化要因になる。",
 dialogue:[
 ["奏汰","AIがサムネや編集まで考えてくれるなら、動画作りはめちゃくちゃ楽になるね。"],
 ["日向","短期的にはそう。でも全員が『伸びやすい正解』をAIから教わると、動画が似てくる可能性がある。"],
 ["奏汰","上手い動画が価値じゃなくなる？"],
 ["日向","制作の上手さは標準装備に近づく。すると何を撮るか、何を知っているか、その人にしか語れないことが重要になる。"],
 ["奏汰","AIが上手くなるほど、人間っぽさが希少になる？"],
 ["日向","その可能性は高い。技術が均質化すると、経験と視点がブランドになる。"]
]}
];

const grid=document.getElementById("episodeGrid");
const search=document.getElementById("search");
const sortOrder=document.getElementById("sortOrder");
const articleSort=document.getElementById("articleSortOrder");
const chips=document.getElementById("categoryFilters");
const featured=document.getElementById("featured");
const homeView=document.getElementById("homeView");
const articleView=document.getElementById("articleView");
const articleContent=document.getElementById("articleContent");
const relatedGrid=document.getElementById("relatedGrid");
const categories=["すべて",...new Set(episodes.map(e=>e.category))];
let activeCategory="すべて";

function niceDate(date){const [y,m,d]=date.split(".");return `${y}年${Number(m)}月${Number(d)}日`}
function setHash(hash){if(location.hash===hash)renderRoute();else location.hash=hash}
function sortedEpisodes(list=episodes){
 return [...list].sort((a,b)=>sortOrder.value==="oldest"?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
}
function renderFeatured(){
 const e=[...episodes].sort((a,b)=>b.date.localeCompare(a.date))[0];
 featured.innerHTML=`
  <img class="featured-image" src="${e.image}" alt="${e.imageAlt}">
  <div class="featured-overlay"></div>
  <div class="featured-copy">
   <div class="featured-meta"><span>特集</span><span>｜</span><span>${e.category}</span><span>${niceDate(e.date)}</span></div>
   <h1>${e.title}</h1>
   <p>${e.summary}</p>
   <a class="featured-read" href="#article-${e.no}">最新の討論を読む →</a>
  </div>
  <span class="image-note">${e.credit}</span>`;
}
function renderChips(){
 chips.innerHTML=categories.map(c=>`<button class="category-chip ${c===activeCategory?"active":""}" data-category="${c}">${c}</button>`).join("");
 chips.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.category;renderChips();renderCards()}));
}
function renderCards(){
 const q=search.value.trim().toLowerCase();
 let rows=episodes.filter(e=>(activeCategory==="すべて"||e.category===activeCategory)&&[e.title,e.summary,e.category,e.takeaway].join(" ").toLowerCase().includes(q));
 rows=sortedEpisodes(rows);
 grid.innerHTML=rows.length?rows.map(e=>`
  <article class="news-card" data-id="${e.no}" tabindex="0" role="link" aria-label="${e.title}">
   <div class="news-card-image-wrap">
    <img loading="lazy" src="${e.image}" alt="${e.imageAlt}">
    <span class="image-badge">${e.category}</span>
   </div>
   <div class="news-card-meta"><span class="category">#${String(e.no).padStart(2,"0")}</span><time>${niceDate(e.date)}</time></div>
   <h2>${e.title}</h2>
   <p>${e.summary}</p>
   <div class="news-card-footer"><span class="byline"><span class="mini-avatar">対</span>奏汰 × 日向</span><span>読む →</span></div>
  </article>`).join(""):'<div class="empty">条件に一致する記事がありません。</div>';
 grid.querySelectorAll(".news-card").forEach(card=>{
   const open=()=>setHash("#article-"+card.dataset.id);
   card.addEventListener("click",open);
   card.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();open()}});
 });
}
function renderArticle(id){
 const e=episodes.find(x=>x.no===id);
 if(!e){setHash("#archive");return}
 document.title=`${e.title} | 奏汰と日向のニュース討論`;
 articleContent.innerHTML=`
  <div class="article-hero">
   <img src="${e.image}" alt="${e.imageAlt}">
   <span class="image-note">${e.credit} / 記事テーマを表すイメージ</span>
  </div>
  <div class="article-body-wrap">
   <header class="article-header">
    <div class="article-labels"><span class="category">${e.category}</span><span>#${String(e.no).padStart(2,"0")}</span><time>${niceDate(e.date)}</time></div>
    <h1>${e.title}</h1>
    <p class="article-deck">${e.summary}</p>
   </header>
   <div class="author-strip">
    <div class="author"><span class="author-avatar k">奏</span><div><strong>奏汰</strong><small>好奇心と鋭い問い</small></div></div>
    <div class="author"><span class="author-avatar h">日</span><div><strong>日向</strong><small>歴史・経済・地政学</small></div></div>
   </div>
   <p class="article-intro">${e.summary} 今回は、この出来事の背景、当事者の利害、見落とされやすい構造、そして長期的に世界へ何を残すのかを二人の対話から読み解く。</p>
   <section class="dialogue">
    ${e.dialogue.map(([who,text])=>`<div class="exchange ${who==="奏汰"?"kanata":"hinata"}"><div class="who">${who}</div><div class="bubble"><span class="speaker-name">${who}</span>${text}</div></div>`).join("")}
   </section>
   <div class="takeaway"><strong>KEY TAKEAWAY</strong>${e.takeaway}</div>
  </div>`;
 const related=episodes.filter(x=>x.no!==id).sort((a,b)=>Math.abs(a.no-id)-Math.abs(b.no-id)).slice(0,3);
 relatedGrid.innerHTML=related.map(x=>`<article class="related-card" data-id="${x.no}"><img loading="lazy" src="${x.image}" alt="${x.imageAlt}"><h3>${x.title}</h3></article>`).join("");
 relatedGrid.querySelectorAll(".related-card").forEach(c=>c.addEventListener("click",()=>setHash("#article-"+c.dataset.id)));
 window.scrollTo({top:0,behavior:"instant"});
}
function renderRoute(){
 const m=location.hash.match(/^#article-(\d+)$/);
 if(m){
   homeView.hidden=true;articleView.hidden=false;renderArticle(Number(m[1]));
 }else{
   articleView.hidden=true;homeView.hidden=false;document.title="奏汰と日向のニュース討論";
   if(location.hash==="#archive")setTimeout(()=>document.getElementById("archive").scrollIntoView(),0);
 }
}
search.addEventListener("input",renderCards);
sortOrder.addEventListener("change",()=>{articleSort.value=sortOrder.value;renderCards()});
articleSort.addEventListener("change",()=>{sortOrder.value=articleSort.value;renderCards();setHash("#archive")});
document.getElementById("backToArchive").addEventListener("click",()=>setHash("#archive"));
document.getElementById("menuButton").addEventListener("click",()=>setHash("#archive"));
window.addEventListener("hashchange",renderRoute);
renderFeatured();renderChips();renderCards();renderRoute();
