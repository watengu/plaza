import { BackButton } from "@/app/forms";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <main>
      <BackButton fallback="/" />
      <header className="top">
        <h1>広場について</h1>
        <span className="sub">テスト公開中</span>
      </header>
      <p className="empty-note" style={{ paddingTop: 2 }}>
        広場は、ジャンル別の総合掲示板です。マァスゥ本体とは、まだ連携していません。
      </p>

      <div className="proof-head" style={{ paddingTop: 18 }}>
        <h2 className="sec-h">仕組みは、3段だけです。</h2>
        <p className="sec-lead">
          板（ジャンル）の中に、スレッド（話題）があり、その中にカード（投稿）が流れます。カードは必ずスレッドの中にあり、独立したカードはありません。書くときの動詞は「流す」だけです。新しい話題をはじめるときは、板のフォームから最初のカードも一緒に流れます。
        </p>
      </div>

      <section className="safety">
        <h2>知らない人と、<br />直接つながらない。</h2>
        <div className="spt"><div className="sn">1</div><div><b>匿名じゃありません</b><p>カードには表示名とプロフィールが出ます。捨てアカの荒らしは、仕組みの側で入り口を狭くします。</p></div></div>
        <div className="spt"><div className="sn">2</div><div><b>連絡は、許可制です</b><p>広場から直接DMはできません。エンカ申請に相手が許可して、初めてマァスゥのつながりになります。</p></div></div>
        <div className="spt"><div className="sn">3</div><div><b>書いたものは、消えます</b><p>カードは24時間で表示から消えます。残り続ける前提の場所では書けないことも、ここでは書けます。</p></div></div>
      </section>

      <section className="feat">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/interior.jpg" alt="" />
        <div className="feat-no">機能 01 ― お知らせ固定</div>
        <h2>大事な話は、一番上に。</h2>
        <p>運営からの連絡と、板ごとの大事なカードは、流れの上に固定されます。流れて消える場所だからこそ、見逃してはいけないものは止めておく。</p>
      </section>

      <section className="feat">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/date.jpg" alt="" />
        <div className="feat-no">機能 02 ― 24時間で消える</div>
        <h2>残らないから、正直に書ける。</h2>
        <p>カードには残り時間がつきます。終わりが近いほど、時間の表示は熱を持ちます。今日の相談は、今日のうちに。</p>
        <div className="chips">
          <span className="chip">投稿したて　23:59:41</span>
          <span className="chip">あと少し　2:41:08</span>
          <span className="chip hot">まもなく消える　24:10</span>
        </div>
        <p className="chip-note">残り時間の表示例です</p>
      </section>

      <section className="feat">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/fiore.jpg" alt="" />
        <div className="feat-no">機能 03 ― エンカ申請</div>
        <h2>気になったら、申請ひとつ。</h2>
        <p>広場は出会いの入口ですが、連絡先の交換場所ではありません。つながり方は、マァスゥのルール通りです。</p>
        <div className="steps">
          <div className="step"><div className="sn2">1</div><div><b>カードにエンカ申請</b><p>気になる投稿者に、申請を1つ送ります</p></div></div>
          <div className="step"><div className="sn2">2</div><div><b>相手が許可したら、つながる</b><p>許可されなければ、それ以上は何も起きません</p></div></div>
          <div className="step"><div className="sn2">3</div><div><b>最初はスタンプだけ、3日で判定</b><p>マァスゥの接続ルールが、そのまま適用されます</p></div></div>
        </div>
      </section>

      <section className="promise">
        <h2>広場の約束</h2>
        <div className="pli">実在のカードだけを置きます。サンプルの声は作りません</div>
        <div className="pli">消える時間を、すべてのカードに表示します</div>
        <div className="pli">連絡は許可制。広場から直接のDMはできません</div>
      </section>
      <div style={{ height: 100 }} />
    </main>
  );
}
