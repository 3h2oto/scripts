addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

let hostname;

function formHTML(message) {
	return `<!doctype html>
<html lang="en-US">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Login - ChatGPT</title>
		<style>
			@charset "UTF-8";
			.oai-header img {
				display: flex;
				height: 32px;
				width: 32px;
				background-color: #fff;
				padding: 32px 0 0;
				fill: #202123;
			}

			a {
				font-weight: 400;
				text-decoration: inherit;
				color: #10a37f;
			}

			.main-container {
				flex: 1 0 auto;
				min-height: 0;
				display: grid;
				box-sizing: border-box;
				grid-template-rows: [left-start center-start right-start] 1fr [left-end center-end right-end];
				grid-template-columns: [left-start center-start] 1fr [left-end right-start] 1fr [center-end right-end];
				align-items: center;
				justify-content: center;
				justify-items: center;
				grid-column-gap: 160px;
				column-gap: 160px;
				padding: 80px;
				width: 100%;
			}

			.login-container {
				background-color: #fff;
				padding: 0 40px 40px;
				border-radius: 3px;
				box-shadow: none;
				width: 320px;
				box-sizing: content-box;
				flex-shrink: 0;
			}

			.title-wrapper {
				padding: 40px 40px 24px;
				box-sizing: content-box;
			}

			.title {
				font-size: 32px;
				font: 'Söhne';
				margin: 24px 0 0;
				color: #2d333a;
				width: 320px;
				text-align: center;
			}

			.input-wrapper {
				position: relative;
				margin-bottom: 25px;
				width: 320px;
				box-sizing: content-box;
			}

			.username-input {
				-webkit-appearance: none;
				-moz-appearance: none;
				appearance: none;
				background-color: #fff;
				border: 1px solid #c2c8d0;
				border-radius: 6px;
				box-sizing: border-box;
				color: #2d333a;
				font-family: inherit;
				font-size: 16px;
				height: 52px;
				line-height: 1.1;
				outline: none;
				padding-block: 1px;
				padding-inline: 2px;
				padding: 0 16px;
				transition:
					box-shadow 0.2s ease-in-out,
					border-color 0.2s ease-in-out;
				width: 100%;
				text-rendering: auto;
				letter-spacing: normal;
				word-spacing: normal;
				text-transform: none;
				text-indent: 0px;
				text-shadow: none;
				display: inline-block;
				text-align: start;
				margin: 0;
			}

			.username-input:focus,
			.username-input:valid {
				border: 1px solid #10a37f;
				outline: none;
			}

			.username-input:focus-within {
				box-shadow: 1px #10a37f;
			}

			.username-input:focus + .username-label,
			.username-input:valid + .username-label {
				font-size: 14px;
				top: 0;
				left: 10px;
				color: #10a37f;
				background-color: #fff;
			}

			.username-label {
				position: absolute;
				top: 26px;
				left: 16px;
				background-color: #fff;
				color: #6f7780;
				font-size: 16px;
				font-weight: 400;
				margin-bottom: 8px;
				max-width: 90%;
				overflow: hidden;
				pointer-events: none;
				padding: 1px 6px;
				text-overflow: ellipsis;
				transform: translateY(-50%);
				transform-origin: 0;
				transition:
					transform 0.15s ease-in-out,
					top 0.15s ease-in-out,
					padding 0.15s ease-in-out;
				white-space: nowrap;
				z-index: 1;
			}

			.continue-btn {
				position: relative;
				height: 52px;
				width: 320px;
				background-color: #10a37f;
				color: #fff;
				margin: 24px 0 0;
				align-items: center;
				justify-content: center;
				display: flex;
				border-radius: 6px;
				padding: 4px 16px;
				font: inherit;
				border-width: 0px;
				cursor: pointer;
			}

			.continue-btn:hover {
				box-shadow: inset 0 0 0 150px #0000001a;
			}

			:root {
				font-family:
					Söhne,
					-apple-system,
					BlinkMacSystemFont,
					Helvetica,
					sans-serif;
				line-height: 1.5;
				font-weight: 400;
				font-synthesis: none;
				text-rendering: optimizeLegibility;
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
			}

			.page-wrapper {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				min-height: 100%;
			}

			.oai-header {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				background-color: #fff;
			}

			.oai-header img {
				display: flex;
				height: 64px;
				width: 64px;
				background-color: #fff;
				padding: 64px 0 0;
				fill: #202123;
			}

			body {
				background-color: #fff;
				display: block;
				margin: 0;
			}

			.content-wrapper {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				width: 100%;
				height: auto;
				white-space: normal;
				border-radius: 5px;
				position: relative;
				grid-area: center;
				box-shadow: none;
				vertical-align: baseline;
				box-sizing: content-box;
			}
		</style>
	</head>
	<body>
		<div id="root">
			<div class="page-wrapper">
				<header class="oai-header"><img src="https://img2.imgtp.com/2024/04/20/z9twuEmo.svg" alt="OpenAI's Logo" /></header>
				<main class="main-container">
					<section class="content-wrapper">
						<div class="title-wrapper"><h1 class="title">${message}</h1></div>
						<div class="login-container">
							<form method="POST">
								<div class="input-wrapper">
									<input
										class="username-input"
										inputmode="username"
										type="username"
										id="username-input"
										name="username"
										autocomplete="username"
										autocapitalize="none"
										spellcheck="false"
										required
										placeholder=" "
									/><label class="username-label" for="username-input">Enter your username here</label>
								</div>
								<button class="continue-btn">Continue</button>
							</form>
						</div>
					</section>
				</main>
			</div>
		</div>
	</body>
</html>
`;
}

function parseJwt(token) {
    const base64Url = token.split('.')[1]; // 获取载荷部分
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // 将 Base64Url 转为 Base64
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload); // 返回载荷解析后的 JSON 对象
}

function isTokenExpired(token) {
    try {
        const payload = parseJwt(token);
        const currentTime = Math.floor(Date.now() / 1000); // 获取当前时间戳（秒）
        return payload.exp < currentTime; // 检查 token 是否过期
    } catch {
        return true;
    }
}

async function getOAuthLink(shareToken) {
    const url = `https://new.oaifree.com/api/auth/oauth_token`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Origin': `https://${hostname}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            share_token: shareToken
        })
    })
    const data = await response.json();
    return data.login_url;
}

async function getShareToken(userName, at) {
    const url = 'https://chat.oaifree.com/token/register';
    const body = new URLSearchParams({
        // 此处为获取Share Token时的请求参数，可自行配置
        access_token: at,
        unique_name: userName,
        site_limit: '', // 限制的网站
        expires_in: '0', // token有效期（单位为秒），填 0 则永久有效
        gpt35_limit: '-1', // gpt3.5 对话限制
        gpt4_limit: '-1', // gpt4 对话限制
        show_conversations: 'false', // 是否显示所有人的会话
        show_userinfo: 'false', // 是否显示用户信息
        reset_limit: 'false' // 是否重置对话限制
    }).toString();
    const apiResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    });
    const responseText = await apiResponse.text();
    const tokenKeyMatch = /"token_key":"([^"]+)"/.exec(responseText);
    const tokenKey = tokenKeyMatch ? tokenKeyMatch[1] : 'share token 获取失败';
    return tokenKey;
}

async function redirectOAuth(un) {
    // @ts-ignore
    let accessToken = await oai_global_variables.get('at');
    if (isTokenExpired(accessToken)) {
        // 给没有refresh token的萌新用（比如我），取消下面这行注释即可享用
        // return new Response('当前access token未更新，请联系管理员更新', { status: 401 });

        // 如果 Token 过期，执行获取新 Token 的逻辑
        const url = 'https://token.oaifree.com/api/auth/refresh';
        // @ts-ignore
        const refreshToken = await oai_global_variables.get('rt');  // 实际情况下你可能会从某处获取这个值

        // 发送 POST 请求
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: `refresh_token=${refreshToken}`
        });

        // 检查响应状态
        if (response.ok) {
            const data = await response.json();  // 假设服务器返回的是 JSON 格式数据
            accessToken = data.access_token; // 直接从 JSON 中获取 access_token

            // @ts-ignore
            await oai_global_variables.put('at', accessToken);
        } else {
            return new Response('Error fetching access token', { status: response.status });
        }
    }
    // @ts-ignore
    const tokenPrefix = await oai_global_variables.get('token_prefix');

    const shareToken = await getShareToken(tokenPrefix + un, accessToken);
    if (shareToken === 'share token 获取失败') {
        return new Response('token获取失败，请刷新重试', { status: 500 });
    }

    return Response.redirect(await getOAuthLink(shareToken), 302);
}

async function handleLogin(request) {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);
    let userName = params.get('un');

	if (request.method === 'POST') {
		const formData = await request.formData();
		const submittedUserName = formData.get('username')?.toString().trim();
		if (submittedUserName) {
			userName = submittedUserName;
		}
	}

    if (userName) {
        // @ts-ignore
        // 验证用户名是否存在
        const users = await oai_global_variables.get("users");
        if (users.split(",").includes(userName)) {
            return redirectOAuth(userName);
        } else {
            return new Response(formHTML(`Invalid user name, please retry`), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
    } else if (request.method === 'POST') {
		const formData = await request.formData();
		const userName = formData.get('username')?.toString().trim();
        return Response.redirect(`https://${hostname}/?un=${userName}`, 302);
	} else {
        return new Response(formHTML("Welcome back!"), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
	}
}

async function handleRequest(request) {

    const url = new URL(request.url);
	hostname = url.hostname;
    const params = new URLSearchParams(url.search);
    const userName = params.get('un');
    if (userName || url.pathname === '/auth/login_auth0' || url.pathname === '/auth/login') {
        return handleLogin(request);
    } else {
        url.host = 'new.oaifree.com';
        return fetch(new Request(url, request));
    }
}
