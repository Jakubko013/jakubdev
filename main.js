(function(){
  "use strict";

  const I18N = {
    cs: {
      _title: 'Jakub Kočvara — volejbal × kód',
      nav_about: 'O mně', nav_career: 'Kariéra', nav_services: 'Služby', nav_contact: 'Kontakt',
      hero_eyebrow: 'volejbalista // vývojář',
      hero_role: '24 let. <b>6 sezón</b> na profesionálních hřištích ve třech zemích, teď stejnou disciplínu a tah na branku přenáším do <b>kódu</b>. Tahle stránka je toho důkaz.',
      stat1_num: '<span>2.</span> &amp; <span>3.</span>',
      stat1_label: 'Místo na MČR juniorů ve volejbale',
      stat2_label: 'Bodující hráč — Španělsko Superliga 2',
      stat3_num: '3 <span>roky</span>',
      stat3_label: 'Česká volejbalová extraliga — Volejbal Brno',
      stat4_label: 'Bodující hráč v Rakousku i Španělsku',
      s1_title: 'Kariéra na hřišti',
      s1_sub: 'Chronologicky — odkud jsem vyrazil a kam mě to zatím zavedlo.',
      t1_year: 'Juniorská kategorie',
      t1_title: '2. a 3. místo na MČR juniorů',
      t1_desc: 'Dvakrát na stupních vítězů na mistrovství České republiky juniorů ve volejbale — jednou stříbro, jednou bronz.',
      t1_tags: '<span>ČR</span><span>junioři</span><span>volejbal</span>',
      t2_year: '3 sezóny',
      t2_title: 'Volejbal Brno — česká extraliga',
      t2_desc: 'Tři roky v nejvyšší české soutěži. Hřiště, na kterém se z nadějného juniora stává hráč, na kterého se dá spolehnout.',
      t2_tags: '<span>Extraliga ČR</span><span>3 sezóny</span>',
      t3_year: '2 sezóny',
      t3_title: 'TJ Sokol Wien — rakouská Bundesliga',
      t3_desc: 'Přesun do Rakouska a obě sezóny v top 5 bodujících hráčů ligy. Důkaz, že forma nebyla náhoda.',
      t3_tags: '<span>Bundesliga</span><span>Top 5 — obě sezóny</span>',
      t4_year: '1 sezóna',
      t4_title: 'Španělsko — Superliga 2',
      t4_desc: 'Poslední zastávka zatím: španělská Superliga 2, kde jsem skončil mezi top 3 bodujícími hráči soutěže.',
      s2_title: 'Co umím mimo hřiště',
      s2_sub: 'Volejbal mě naučil disciplíně a opakování. Stejný přístup teď dávám do programování.',
      stack_git: 'Git / nasazování',
      p1_title: '<span class="pmono">if</span> trénink == kód',
      p1_body: 'Stejně jako na hřišti — žádné zkratky, jen opakovaná práce, dokud výsledek nesedí.',
      p2_title: '<span class="pmono">for</span> každý projekt',
      p2_body: 'Beru každou stránku jako zápas — nastuduju soupeře (zadání), připravím taktiku a jdu na sto procent.',
      p3_title: '<span class="pmono">return</span> výsledek, ne výmluvy',
      p3_body: 'Tři země, tři ligy, šest sezón — naučily mě dotahovat věci do konce i pod tlakem deadlinu.',
      s3_title: 'Co pro tebe můžu udělat',
      s3_sub: 'Jasná nabídka bez keců — tři věci, se kterými za mnou můžeš přijít.',
      sv1_title: 'Prezentační web (one-page)',
      sv1_desc: 'Moderní jednostránkový web jako tenhle — pro tebe, tvou firmu nebo projekt. Rychlý, responzivní, žádné šablony.',
      sv2_title: 'Weby pro sportovce a kluby',
      sv2_desc: 'Profil hráče, trenéra nebo oddílu. Z první ruky vím, co sportovec potřebuje ukázat — výsledky, video, kontakt pro agenty a sponzory.',
      sv3_title: 'Úpravy a údržba webu',
      sv3_desc: 'Máš web, který potřebuje oživit, zrychlit nebo jen pravidelně udržovat? Postarám se o něj.',
      sv_note: 'Weby jsem dělal už dřív — ale jen pro radost. Nikdy jsem v tom nepodnikal ani nenabízel služby. Teď přišel ten pravý čas. Pro tebe to znamená <b>férovou startovní cenu</b> a to, že tvému projektu dám maximum — potřebuju, aby moje první reference stály za to. Tahle stránka je moje vizitka, posuď sám, jestli ti styl sedí.',
      c_eyebrow: 'pojďme na to',
      c_title: 'Hledáš web, který <span class="accent">vyhraje set</span>? <br>Napiš mi.',
      f_note: 'postaveno ručně, řádek po řádku',
      scroll_cue: 'scroll'
    },
    en: {
      _title: 'Jakub Kočvara — volleyball × code',
      nav_about: 'About', nav_career: 'Career', nav_services: 'Services', nav_contact: 'Contact',
      hero_eyebrow: 'volleyball player // developer',
      hero_role: '24 years old. <b>6 seasons</b> on professional courts in three countries — now I bring the same discipline and drive into <b>code</b>. This page is the proof.',
      stat1_num: '<span>2nd</span> &amp; <span>3rd</span>',
      stat1_label: 'Place at the Czech Junior Volleyball Championship',
      stat2_label: 'Top scoring player — Spanish Superliga 2',
      stat3_num: '3 <span>years</span>',
      stat3_label: 'Czech Volleyball Extraliga — Volejbal Brno',
      stat4_label: 'Top scoring player in Austria and Spain',
      s1_title: 'Career on the court',
      s1_sub: 'Chronologically — where I started and where it has taken me so far.',
      t1_year: 'Junior category',
      t1_title: '2nd &amp; 3rd place at the Czech Junior Championship',
      t1_desc: 'Twice on the podium at the Czech junior volleyball championship — one silver, one bronze.',
      t1_tags: '<span>Czechia</span><span>juniors</span><span>volleyball</span>',
      t2_year: '3 seasons',
      t2_title: 'Volejbal Brno — Czech Extraliga',
      t2_desc: 'Three years in the top Czech league. The court where a promising junior becomes a player you can rely on.',
      t2_tags: '<span>Czech Extraliga</span><span>3 seasons</span>',
      t3_year: '2 seasons',
      t3_title: 'TJ Sokol Wien — Austrian Bundesliga',
      t3_desc: 'A move to Austria and both seasons among the league\'s top 5 scorers. Proof that the form was no accident.',
      t3_tags: '<span>Bundesliga</span><span>Top 5 — both seasons</span>',
      t4_year: '1 season',
      t4_title: 'Spain — Superliga 2',
      t4_desc: 'The latest stop so far: Spanish Superliga 2, where I finished among the top 3 scorers of the competition.',
      s2_title: 'What I do off the court',
      s2_sub: 'Volleyball taught me discipline and repetition. I now bring the same approach to programming.',
      stack_git: 'Git / deployment',
      p1_title: '<span class="pmono">if</span> training == code',
      p1_body: 'Just like on the court — no shortcuts, only repeated work until the result is right.',
      p2_title: '<span class="pmono">for</span> every project',
      p2_body: 'I treat every website like a match — I study the opponent (the brief), prepare the tactics and give it a hundred percent.',
      p3_title: '<span class="pmono">return</span> results, not excuses',
      p3_body: 'Three countries, three leagues, six seasons — they taught me to finish things even under deadline pressure.',
      s3_title: 'What I can do for you',
      s3_sub: 'A clear offer, no fluff — three things you can come to me with.',
      sv1_title: 'One-page website',
      sv1_desc: 'A modern single-page site like this one — for you, your business or your project. Fast, responsive, no templates.',
      sv2_title: 'Sites for athletes & clubs',
      sv2_desc: 'A profile for a player, coach or club. I know first-hand what an athlete needs to show — results, video, contact for agents and sponsors.',
      sv3_title: 'Website updates & maintenance',
      sv3_desc: 'Got a site that needs a refresh, a speed-up, or just regular care? I\'ll look after it.',
      sv_note: 'I\'ve been building websites for a while — but purely for the fun of it. I never ran it as a business or offered my services. Now the time is right. For you that means a <b>fair starter price</b> and my full effort on your project — I need my first references to be worth showing. This page is my calling card; judge for yourself whether the style fits.',
      c_eyebrow: 'let\'s do this',
      c_title: 'Looking for a website that <span class="accent">wins the set</span>? <br>Drop me a line.',
      f_note: 'built by hand, line by line',
      scroll_cue: 'scroll'
    }
  };

  // extra keys for the multi-page layout (home CTA, page labels)
  Object.assign(I18N.cs, {
    home_cta_eyebrow: 'a co teď',
    home_cta_title: 'Líbí se ti, jak k tomu přistupuju? <br><span class="accent">Pojďme</span> na tvůj web.',
    home_cta_services: 'Co nabízím →',
    home_cta_contact: 'Napiš mi',
    sv_label: 'služby',
    sv_cta: 'Napiš mi →',
    c_label: 'kontakt'
  });
  Object.assign(I18N.en, {
    home_cta_eyebrow: 'what now',
    home_cta_title: 'Like the way I go about it? <br><span class="accent">Let\'s</span> build your site.',
    home_cta_services: 'What I offer →',
    home_cta_contact: 'Get in touch',
    sv_label: 'services',
    sv_cta: 'Get in touch →',
    c_label: 'contact'
  });

  const codeByLang = {
    cs: [
      {t:'const', c:'tk-key'}, {t:' jakub', c:''}, {t:' = ', c:'tk-punct'}, {t:'{\n', c:'tk-punct'},
      {t:'  věk', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:'24', c:'tk-num'}, {t:',\n', c:'tk-punct'},
      {t:'  pozice', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:"'diagonální útočník'", c:'tk-str'}, {t:',\n', c:'tk-punct'},
      {t:'  ligy', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:'[', c:'tk-punct'}, {t:"'CZ'", c:'tk-str'}, {t:', ', c:'tk-punct'}, {t:"'AT'", c:'tk-str'}, {t:', ', c:'tk-punct'}, {t:"'ES'", c:'tk-str'}, {t:'],\n', c:'tk-punct'},
      {t:'  tituly', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:"'2. a 3. místo MČR juniorů'", c:'tk-str'}, {t:',\n', c:'tk-punct'},
      {t:'  topBodující', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:'true', c:'tk-num'}, {t:',\n', c:'tk-punct'},
      {t:'  miluje', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:"'programování'", c:'tk-str'}, {t:',\n', c:'tk-punct'},
      {t:'  dostupný', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:'true', c:'tk-num'}, {t:'\n', c:'tk-punct'},
      {t:'}', c:'tk-punct'}, {t:';', c:'tk-punct'},
      {t:'\n\n// stránku co čteš jsem napsal sám', c:'tk-com'}
    ],
    en: [
      {t:'const', c:'tk-key'}, {t:' jakub', c:''}, {t:' = ', c:'tk-punct'}, {t:'{\n', c:'tk-punct'},
      {t:'  age', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:'24', c:'tk-num'}, {t:',\n', c:'tk-punct'},
      {t:'  position', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:"'opposite hitter'", c:'tk-str'}, {t:',\n', c:'tk-punct'},
      {t:'  leagues', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:'[', c:'tk-punct'}, {t:"'CZ'", c:'tk-str'}, {t:', ', c:'tk-punct'}, {t:"'AT'", c:'tk-str'}, {t:', ', c:'tk-punct'}, {t:"'ES'", c:'tk-str'}, {t:'],\n', c:'tk-punct'},
      {t:'  titles', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:"'2nd & 3rd at Czech Junior Championship'", c:'tk-str'}, {t:',\n', c:'tk-punct'},
      {t:'  topScorer', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:'true', c:'tk-num'}, {t:',\n', c:'tk-punct'},
      {t:'  loves', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:"'programming'", c:'tk-str'}, {t:',\n', c:'tk-punct'},
      {t:'  available', c:'tk-key'}, {t:': ', c:'tk-punct'}, {t:'true', c:'tk-num'}, {t:'\n', c:'tk-punct'},
      {t:'}', c:'tk-punct'}, {t:';', c:'tk-punct'},
      {t:'\n\n// I wrote the page you\'re reading myself', c:'tk-com'}
    ]
  };

  // ---------- language (persisted across pages) ----------
  function getSavedLang(){
    try { var v = localStorage.getItem('lang'); if(v==='cs'||v==='en') return v; } catch(e){}
    return 'cs';
  }
  function saveLang(l){ try { localStorage.setItem('lang', l); } catch(e){} }

  var lang = getSavedLang();

  // typing terminal — only present on the home page
  var target = document.getElementById('typeTarget');
  var typingGen = 0;
  function startTyping(codeArr){
    var gen = ++typingGen;
    target.innerHTML = '';
    var idx = 0;
    function typeNext(){
      if(gen !== typingGen) return;
      if(idx >= codeArr.length){
        var cur = document.createElement('span');
        cur.className = 'cursor';
        target.appendChild(cur);
        return;
      }
      var chunk = codeArr[idx];
      var span = document.createElement('span');
      if(chunk.c) span.className = chunk.c;
      var i = 0;
      var text = chunk.t;
      function typeChar(){
        if(gen !== typingGen) return;
        if(i < text.length){
          span.textContent += text[i];
          i++;
          setTimeout(typeChar, 12 + Math.random()*18);
        } else {
          idx++;
          setTimeout(typeNext, 30);
        }
      }
      target.appendChild(span);
      typeChar();
    }
    typeNext();
  }

  function applyLang(l, restartTerminal){
    lang = l;
    var dict = I18N[l];
    var root = document.documentElement;
    root.setAttribute('lang', l);
    var t = root.getAttribute('data-title-' + l);
    if(t) document.title = t;
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if(dict[key] !== undefined) el.innerHTML = dict[key];
    });
    var btn = document.getElementById('langToggle');
    if(btn){
      btn.textContent = (l === 'cs') ? 'EN' : 'CZ';
      btn.setAttribute('aria-label', (l === 'cs') ? 'Switch to English' : 'Přepnout do češtiny');
    }
    if(target && restartTerminal) startTyping(codeByLang[l]);
  }

  var langBtn = document.getElementById('langToggle');
  if(langBtn) langBtn.addEventListener('click', function(){
    var nl = (lang === 'cs') ? 'en' : 'cs';
    saveLang(nl);
    applyLang(nl, true);
  });

  // apply saved/default language on load (terminal started separately, with a small delay)
  applyLang(lang, false);
  if(target) setTimeout(function(){ if(typingGen === 0) startTyping(codeByLang[lang]); }, 400);

  // ---------- mobile nav ----------
  var headerEl = document.querySelector('header');
  var navToggle = document.getElementById('navToggle');
  if(headerEl && navToggle){
    navToggle.addEventListener('click', function(){
      var open = headerEl.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }
  document.querySelectorAll('nav a').forEach(function(a){
    a.addEventListener('click', function(){
      if(headerEl) headerEl.classList.remove('nav-open');
      if(navToggle) navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ---------- reveal on scroll ----------
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        if(e.target.classList.contains('stack-grid')){
          e.target.querySelectorAll('.stack-row').forEach(function(r){ r.classList.add('in-view'); });
        }
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
})();
