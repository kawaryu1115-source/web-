// --- 状態管理（簡易的なDNSキャッシュ・辞書） ---
const dnsCache = {}; // 生成したIPアドレスとドメインの対応を記録する

// --- DOM要素の取得 ---
const guideBubble = document.getElementById('guide-bubble');
const guideText = document.getElementById('guide-text');

// Section A (DNS)
const domainInput = document.getElementById('domain-input');
const dnsBtn = document.getElementById('dns-btn');
const dnsLoading = document.getElementById('dns-loading');
const dnsResult = document.getElementById('dns-result');
const ipDisplay = document.getElementById('ip-display');
const copyBtn = document.getElementById('copy-btn');

// Section B (Browser)
const browserInput = document.getElementById('browser-input');
const accessBtn = document.getElementById('access-btn');
const httpLoading = document.getElementById('http-loading');
const webPageRender = document.getElementById('web-page-render');

// --- 教育用ふきだし表示関数 ---
function showGuide(text) {
    guideText.textContent = text;
    // ふきだしをアニメーションさせるためにクラスをつけ外し
    guideBubble.classList.remove('opacity-100');
    guideBubble.classList.add('opacity-0');
    setTimeout(() => {
        guideBubble.classList.remove('opacity-0');
        guideBubble.classList.add('opacity-100');
    }, 150);
}

// --- ドメインからIPアドレスを生成する関数（ハッシュによる決定論的生成） ---
function generateIPFromDomain(domain) {
    // 文字列を小文字にしてトリム
    const cleanDomain = domain.toLowerCase().trim();
    if (!cleanDomain) return null;

    // 簡単な文字列ハッシュアルゴリズム
    let hash = 0;
    for (let i = 0; i < cleanDomain.length; i++) {
        hash = cleanDomain.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash); // 正の数に

    // ハッシュ値からIPv4の4つのオクテットを生成（予約IPを避けるため適当に調整）
    const octet1 = (hash % 150) + 50; 
    const octet2 = (hash >> 8) % 256;
    const octet3 = (hash >> 16) % 256;
    const octet4 = (hash >> 24) % 256;

    const ip = `${octet1}.${octet2}.${octet3}.${octet4}`;
    
    // 生成したIPとドメインをキャッシュに保存（逆引き用）
    dnsCache[ip] = cleanDomain;
    
    return ip;
}

// --- DNSルックアップボタンのイベント ---
dnsBtn.addEventListener('click', () => {
    const domain = domainInput.value.trim();
    if (!domain) {
        alert("ドメイン名を入力してください！");
        return;
    }

    showGuide('インターネットの電話帳（DNSサーバー）に、IPアドレスを尋ねているよ...');
    
    // UI状態の切り替え
    dnsResult.classList.add('hidden');
    dnsLoading.classList.remove('hidden');
    dnsLoading.classList.add('flex');
    dnsBtn.disabled = true;

    // 擬似的な通信遅延（2.5秒）
    setTimeout(() => {
        const ip = generateIPFromDomain(domain);
        
        dnsLoading.classList.remove('flex');
        dnsLoading.classList.add('hidden');
        
        ipDisplay.textContent = ip;
        dnsResult.classList.remove('hidden');
        dnsBtn.disabled = false;

        showGuide('これがコンピュータ同士が通信するための本当の住所だよ！');
    }, 2500);
});

// --- コピーボタンのイベント ---
copyBtn.addEventListener('click', () => {
    const ip = ipDisplay.textContent;
    // クリップボードにコピー
    navigator.clipboard.writeText(ip).then(() => {
        // コピー成功演出
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> コピーしました！';
        copyBtn.classList.replace('bg-gray-800', 'bg-green-600');
        
        // ブラウザ側のアドレスバーに自動入力（体験をスムーズにするため）
        browserInput.value = ip;
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.replace('bg-green-600', 'bg-gray-800');
            showGuide('IPアドレスをブラウザのアドレスバーに貼り付けよう！');
        }, 2000);
    });
});

// --- ブラウザアクセスボタンのイベント ---
accessBtn.addEventListener('click', () => {
    const ip = browserInput.value.trim();
    if (!ip) {
        alert("IPアドレスを入力してください！");
        return;
    }

    showGuide('IPアドレス宛に「HTMLファイルを送って！」とお願い（HTTPリクエスト）しているよ。');
    
    // UI状態の切り替え
    webPageRender.innerHTML = '';
    httpLoading.classList.remove('hidden');
    httpLoading.classList.add('flex');
    accessBtn.disabled = true;

    // 擬似的な通信遅延（2.5秒）
    setTimeout(() => {
        httpLoading.classList.remove('flex');
        httpLoading.classList.add('hidden');
        accessBtn.disabled = false;

        // キャッシュから入力されたIPに対応するドメインを取得
        const requestedDomain = dnsCache[ip];
        
        renderMockPage(requestedDomain);
        
        showGuide('サーバーからHTMLが届き、ブラウザが画面を描画したよ！');
    }, 2500);
});

// --- ダミーWebページの描画ロジック ---
function renderMockPage(domain) {
    let html = '';

    if (!domain) {
        // IPが見つからない場合 (404エラー風)
        html = `
            <div class="mock-page mock-404">
                <h1>404</h1>
                <h2 class="text-xl font-bold mb-2">Not Found</h2>
                <p>サーバーが見つかりません。</p>
                <p class="text-sm mt-4 text-gray-500">入力したIPアドレスが間違っているか、<br>まだDNSで調べていないIPアドレスです。</p>
            </div>
        `;
    } else if (domain.includes('google')) {
        html = `
            <div class="mock-page mock-google">
                <h1><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></h1>
                <input type="text" placeholder="検索または URL を入力">
                <div>
                    <button>Google 検索</button>
                    <button>I'm Feeling Lucky</button>
                </div>
            </div>
        `;
    } else if (domain.includes('yahoo')) {
        html = `
            <div class="mock-page mock-yahoo w-full">
                <h1>Y! JAPAN</h1>
                <div class="search-box mx-auto">
                    <input type="text">
                    <button><i class="fa-solid fa-magnifying-glass"></i> 検索</button>
                </div>
                <div class="text-left w-4/5 max-w-[400px] mx-auto text-sm">
                    <p class="text-blue-600 font-bold mb-1 underline cursor-pointer">主なニュース</p>
                    <ul class="list-disc ml-5 text-gray-700">
                        <li>今日の天気は晴れ時々曇り</li>
                        <li>週末のイベント情報まとめ</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (domain.includes('youtube')) {
        html = `
            <div class="mock-page mock-youtube w-full">
                <h1><i class="fa-brands fa-youtube"></i> YouTube</h1>
                <div class="video-grid px-4">
                    <div class="video-card flex items-center justify-center text-gray-500 text-xs">動画サムネイル1</div>
                    <div class="video-card flex items-center justify-center text-gray-500 text-xs">動画サムネイル2</div>
                    <div class="video-card flex items-center justify-center text-gray-500 text-xs">動画サムネイル3</div>
                    <div class="video-card flex items-center justify-center text-gray-500 text-xs">動画サムネイル4</div>
                </div>
            </div>
        `;
    } else {
        // 汎用ページ
        html = `
            <div class="mock-page mock-generic">
                <h1>ようこそ！</h1>
                <div class="content-box">
                    <p class="font-bold text-lg mb-2">${domain}</p>
                    <p class="text-sm text-gray-600">このページは、ドメイン名から変換されたIPアドレスを使ってアクセスしたWebページです。</p>
                </div>
            </div>
        `;
    }

    webPageRender.innerHTML = html;
}
