local iterations = 2
local delayInSeconds = 1.5
local nextButtonCoordinates = {x = 1727, y = 533} -- Tọa độ nút "Next"

local function keyStroke(mods, key)
  hs.eventtap.keyStroke(mods, key, 0)
end

local function openApplication(appName)
  local app = hs.application.launchOrFocus(appName)
  if not app then
    hs.alert.show("Không thể mở " .. appName .. ".")
    return false
  end
  hs.timer.usleep(300000)
  return true
end

local function openDevTools()
  keyStroke({"cmd", "alt"}, "j")
  hs.timer.usleep(1000000)
end

local function copyPageContent()
  hs.eventtap.keyStrokes([[(() => {
var text = document.body.innerText.split('\n');
text = text.slice(9, text.length - 9).join('\n');
copy(text);
})();]])
  keyStroke({}, "return")
  hs.timer.usleep(1000000)
end

local function pasteContentInTextEdit()
  if openApplication("TextEdit") then
    keyStroke({"cmd"}, "v")
    keyStroke({}, "return")
    keyStroke({}, "return")
  end
end

local function clickNextButton()
  if openApplication("Google Chrome") then
    keyStroke({"cmd"}, "w") -- Đóng tab hiện tại
    hs.timer.usleep(1000000)
    local pos = hs.mouse.getAbsolutePosition()
    print("Tọa độ chuột: X = " .. pos.x .. ", Y = " .. pos.y) 
    hs.eventtap.leftClick(pos)
    hs.timer.usleep(delayInSeconds * 1000000)
  end
end

hs.hotkey.bind({"cmd", "alt", "ctrl"}, "C", function()
  isCancelled = false
  for i = 1, iterations do
    if openApplication("Google Chrome") then
      openDevTools()
      copyPageContent()
      pasteContentInTextEdit()
      clickNextButton()
    end
  end
end)
