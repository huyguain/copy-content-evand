#Requires AutoHotkey v2.0
#SingleInstance Force

iterations := 30
jsCode := "copy(document.body.innerText.split('\n').slice(9, -9).join('\n'));"

SetKeyDelay(20) ; Giảm độ trễ giữa các phím bấm
SetWinDelay(100) ; Giảm độ trễ giữa các cửa sổ

openApplication(appName, runName) {
    if WinExist(appName) {
        WinActivate(appName)
        WinWaitActive(appName)
    } else {
        Run(runName)
        ; WinWait(appName)
        ; WinActivate(appName)
        WinWaitActive("ahk_exe " appName)
        if !WinExist(appName) {
            MsgBox("Không thể mở " appName ".")
            return false
        }
    }
    return true
}

openDevTools() {
    Send("^+j") ; Mở DevTools
    Sleep(1000)
}

copyPageContent() {
    A_Clipboard := ""  ; Xóa clipboard trước

    SendText(jsCode)     ; Gửi đoạn mã JavaScript dưới dạng văn bản
    Send("{Enter}")      ; Nhấn Enter để thực thi đoạn mã
    Sleep(5000)          ; Chờ 5 giây cho trình duyệt xử lý
}

pasteContentInTextEdit() {
    if (openApplication("ahk_exe notepad++.exe", "notepad++.exe")) {
        Sleep(500) ; Chờ thêm một chút để an toàn
        Send("^v") ; Dán nội dung clipboard
        Send("{Enter}") ; Nhấn Enter để xuống dòng
        Send("{Enter}") ; Nhấn Enter để xuống dòng
    }
}

clickNextButton() {
    if (openApplication("ahk_class Chrome_WidgetWin_1", "")) {
        Send("^+w")
        Sleep(1500)
        Send("{Right}")
        Sleep(1500)
    }
}

^!#c:: {
    Loop iterations {
        if openApplication("ahk_class Chrome_WidgetWin_1", "") {
            openDevTools()
            copyPageContent()
            pasteContentInTextEdit()
            clickNextButton()
        }
    }
}

^!q::ExitApp()
