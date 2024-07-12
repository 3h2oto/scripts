addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

// 主请求处理函数
async function handleRequest(request) {
    if (request.method === "POST") {
        const url = new URL(request.url);
        if (url.pathname === "/accounts") {
            return handleAccountSelection(request);
        } else {
            return handleFormSubmission(request);
        }
    } else {
        return displayLoginPage();
    }
}

// 处理用户提交的表单
async function handleFormSubmission(request) {
    const formData = await request.formData();
    try {
        const unique_name = await validateUser(formData);
        return displayAccountPage(unique_name);
    } catch (error) {
        return displayErrorPage(error.message);
    }
}

// 处理账户选择
async function handleAccountSelection(request) {
    const formData = await request.formData();
    const unique_name = formData.get("unique_name");
    const account_key = formData.get("account_key");

    try {
        const accountData = JSON.parse(await KV.get(account_key));
        const access_token = accountData.access_token || await getValidToken(account_key);
        const shareToken = await generateShareToken(unique_name, access_token);
        const YOUR_DOMAIN = (await KV.get("YOUR_DOMAIN")) || new URL(request.url).host;
        const oauthLink = await getOAuthLink(shareToken, YOUR_DOMAIN);
        return Response.redirect(oauthLink, 302);
    } catch (error) {
        return displayErrorPage(error.message);
    }
}

// 验证用户身份
async function validateUser(formData) {
    const SITE_PASSWORD = (await KV.get("SITE_PASSWORD")) || "";
    const ALLOWED_USERS = (await KV.get("ALLOWED_USERS")) || "";
    const site_password = formData.get("site_password") || "";
    const unique_name = formData.get("unique_name") || "";

    if (site_password !== SITE_PASSWORD) {
        throw new Error("访问密码错误");
    }

    const allowedUsersArray = ALLOWED_USERS.split(",");
    if (!allowedUsersArray.includes(unique_name)) {
        throw new Error("用户不在白名单中");
    }

    return unique_name;
}

// 获取所有账户的键
async function getAccounts() {
    const allKeys = await KV.list(); // 返回所有键的数组
    return allKeys.keys.filter(key => key.name.includes("@")).map(key => key.name);
}

// 获取有效令牌
async function getValidToken(account_key) {
    let accountData = JSON.parse(await KV.get(account_key));
    let token = accountData.access_token;
    if (!token || isTokenExpired(token)) {
        token = await refreshToken(account_key);
    }
    return token;
}

// 刷新 Token
async function refreshToken(account_key) {
    const url = "https://token.oaifree.com/api/auth/refresh";
    let accountData = JSON.parse(await KV.get(account_key));
    const refreshToken = accountData.refresh_token;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: `refresh_token=${refreshToken}`,
    });
    if (!response.ok) throw new Error("Error fetching access token");
    const data = await response.json();
    accountData.access_token = data.access_token;
    await KV.put(account_key, JSON.stringify(accountData));
    return data.access_token;
}

// 生成共享令牌
async function generateShareToken(unique_name, access_token) {
    const url = "https://chat.oaifree.com/token/register";
    const body = new URLSearchParams({
        unique_name,
        access_token,
        site_limit: "",
        expires_in: "0",
        gpt35_limit: "-1",
        gpt4_limit: "-1",
        show_conversations: "true",
        temporary_chat: "false",
        reset_limit: "false",
    });

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    const data = await response.json();
    return data.token_key || "未找到 Share_token";
}

// 获取 OAuth 链接
async function getOAuthLink(shareToken, proxiedDomain) {
    const url = `https://${proxiedDomain}/api/auth/oauth_token`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Origin: `https://${proxiedDomain}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ share_token: shareToken }),
    });
    const data = await response.json();
    return data.login_url;
}

// 解析 JWT Token
function isTokenExpired(token) {
    const payload = parseJwt(token);
    return payload.exp < Math.floor(Date.now() / 1000);
}

function parseJwt(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
    );
    return JSON.parse(jsonPayload);
}

// 显示登录页面
async function displayLoginPage() {
    const TURNSTILE_SITE_KEY = await KV.get("TURNSTILE_SITE_KEY");
    const bingResponse = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US');
    const bingData = await bingResponse.json();
    const imageUrl = `https://www.bing.com${bingData.images[0].url}`;

    const formHtml = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>欢迎使用ChatGPT</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.0/dist/tailwind.min.css" rel="stylesheet">
            <link rel="icon" type="image/png" href="https://img.pub/p/f9a34070cddf25761a27.jpg">
            <style>
                body { background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-attachment: fixed; }
                input::placeholder { color: transparent; }
                input:not(:placeholder-shown) + label, input:focus + label { top: -20px; padding: 0 5px; left: 12px; z-index: 10; background: rgba(255, 255, 255, 0); }
                .container { background: rgba(255, 255, 255, 0.85); border-radius: 15px; padding: 30px; max-width: 400px; margin: auto; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
                .logo { margin: 0 auto 20px; width: 120px; height: auto; }
                .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 15px; }
                .form { margin-top: 20px; }
                .input-field { width: 100%; height: 45px; padding: 10px; border-radius: 5px; border: 1px solid #ccc; margin-bottom: 20px; }
                .button { background-color: #48bb78; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; display: inline-block; transition: background-color 0.3s; width: 100%; }
                .button:hover { background-color: #38a169; }
            </style>
        </head>
        <body class="flex justify-center items-center min-h-screen m-0 bg-black bg-opacity-60">
            <div class="container">
                <img src="https://img.pub/p/85f395a62494973ab1c2.png" alt="ChatGPT" class="logo">
                <h1 class="title">欢迎使用</h1>
                <form method="POST" class="form">
                    <div class="relative mb-4">
                        <input type="text" id="unique_name" name="unique_name" placeholder=" " required class="input-field">
                        <label for="unique_name" class="absolute left-5 top-1 text-green-500 text-sm transition-all duration-300">用户名</label>
                    </div>
                    <div class="relative mb-4">
                        <input type="password" id="site_password" name="site_password" placeholder=" " class="input-field">
                        <label for="site_password" class="absolute left-5 top-1 text-green-500 text-sm transition-all duration-300">口令</label>
                    </div>
                    <div class="cf-turnstile my-4 flex justify-center" data-sitekey="${TURNSTILE_SITE_KEY}" data-callback="onTurnstileCallback"></div>
                    <input type="hidden" id="cf-turnstile-response" name="cf-turnstile-response" required>
                    <button type="submit" class="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors duration-300">点击登录</button>
                </form>
            </div>
        </body>
        <script>
            function onTurnstileCallback(token) {
                document.getElementById('cf-turnstile-response').value = token;
            }

            document.querySelector('form').addEventListener('submit', function(event) {
                if (!document.getElementById('cf-turnstile-response').value) {
                    alert('请完成验证。');
                    event.preventDefault();
                }
            });
        </script>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
        </html>
    `;
    return new Response(formHtml, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    });
}

// 显示账户选择页面
async function displayAccountPage(unique_name) {
    const keys = await getAccounts();
    const accountOptions = keys.map(key => `<option value="${key}">${key}</option>`).join("");
    const formHtml = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>选择账户</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.0/dist/tailwind.min.css" rel="stylesheet">
            <link rel="icon" type="image/png" href="https://img.pub/p/f9a34070cddf25761a27.jpg">
            <style>
                body { display: flex; justify-center: center; align-items: center; min-height: 100vh; margin: 0; }
                .container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); max-width: 400px; width: 100%; }
                .title { font-size: 24px; margin-bottom: 20px; text-align: center; }
                .form { display: flex; flex-direction: column; gap: 10px; }
                .input-field { padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
                .button { background-color: #48bb78; color: white; padding: 12px 20px; border-radius: 5px; text-align: center; transition: background-color 0.3s; cursor: pointer; text-decoration: none; display: block; text-align: center; }
                .button:hover { background-color: #38a169; }
            </style>
        </head>
        <body class="flex justify-center items-center min-h-screen m-0 bg-black bg-opacity-60">
            <div class="container">
                <img src="https://img.pub/p/85f395a62494973ab1c2.png" alt="ChatGPT" class="logo">
                <h1 class="title">选择账户</h1>
                <form method="POST" action="/accounts" class="form">
                    <input type="hidden" name="unique_name" value="${unique_name}">
                    <select name="account_key" class="select">
                        ${accountOptions}
                    </select>
                    <button type="submit" class="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors duration-300">开始使用</button>
                </form>
            </div>
        </body>
        </html>
    `;
    return new Response(formHtml, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    });
}

// 显示错误页面
function displayErrorPage(errorMessage) {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>登录错误</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.0/dist/tailwind.min.css" rel="stylesheet">
            <link rel="icon" type="image/png" href="https://img.pub/p/f9a34070cddf25761a27.jpg">
            <style>
                body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f8d7da; color: #721c24; font-family: sans-serif; }
                .container { background: rgba(255, 255, 255, 0.85); border-radius: 15px; padding: 30px; max-width: 400px; margin: auto; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
                .logo { margin: 0 auto 20px; width: 120px; height: auto; }
                .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 15px; }
                .message { font-size: 18px; color: #e53e3e; margin-bottom: 25px; }
                .button { background-color: #48bb78; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; display: inline-block; transition: background-color 0.3s; }
                .button:hover { background-color: #38a169; }
            </style>
        </head>
        <body class="flex justify-center items-center min-h-screen m-0 bg-black bg-opacity-60">
            <div class="container">
                <img src="https://img.pub/p/85f395a62494973ab1c2.png" alt="ChatGPT" class="logo">
                <h1 class="title">登录错误</h1>
                <p class="message">${errorMessage}</p>
            </div>
        </body>
        </html>
    `;
    return new Response(htmlContent, {
        status: 401,
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}