#!/bin/bash

# use curl function to check the ChatGPT visibility
check_gpt_access() {
    local url=$1
    local status_code=$(curl -o /dev/null -s -w "%{http_code}\n" -X HEAD $url)

    # 判断状态码
    if [ "$status_code" == "400" ]; then
        echo "Forbidden"
    elif [ "$status_code" == "403" ]; then
        echo "Passthrough"
    else
        echo "Unknow"
    fi
}

# Check whether ChatGPT webpage, Android App and iOS App is visitable
web_access=$(check_gpt_access "https://chatgpt.com")
android_access=$(check_gpt_access "https://android.chat.openai.com")
ios_access=$(check_gpt_access "https://ios.chat.openai.com")

# print results
echo "GPT————网页:$web_access ｜ android:$android_access ｜ ios:$ios_access"
