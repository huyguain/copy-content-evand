const fs = require('fs');
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const iterations = parseInt(process.argv[2]) || 10;
const targetUrl = process.argv[3];
const targetProfile = process.argv[4] || 'Default'; // Đường dẫn đến profile Default của Chrome
const outputFile = 'output.txt';
let prevContentPage = '';

// Hàm lấy đường dẫn đến profile Default của Chrome
function getChromeDefaultProfile() {
    const platform = process.platform;
    let userDataDir;

    switch (platform) {
        case 'darwin': // macOS
            userDataDir = path.join(os.homedir(), 'Library/Application Support/Google/Chrome');
            break;
        case 'win32': // Windows
            userDataDir = path.join(process.env.LOCALAPPDATA, 'Google/Chrome/User Data');
            break;
        case 'linux':
            userDataDir = path.join(os.homedir(), '.config/google-chrome');
            break;
        default:
            throw new Error(`Hệ điều hành không được hỗ trợ: ${platform}`);
    }

    return path.join(userDataDir, targetProfile); // Sử dụng profile Default
}

function clearOutputFile() {
    // Xóa nội dung file output.txt nếu tồn tại
    try {
        fs.writeFileSync(outputFile, '', 'utf-8');
        console.log('🗑️ Đã xóa nội dung file output.txt');
    } catch (error) {
        console.error('❌ Lỗi khi xóa file:', error);
    }
}

(async () => {
    try {
        console.log('🚀 Khởi động script...');
        
        // Sử dụng profile Default của Chrome
        const userDataDir = getChromeDefaultProfile();
        console.log('📂 Sử dụng Chrome profile:', userDataDir);

        // Khởi động trình duyệt với profile Default
        console.log('🌐 Đang mở trình duyệt...');
        const context = await chromium.launchPersistentContext(userDataDir, {
            headless: false,
            channel: 'chrome', // Sử dụng Chrome đã cài đặt
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        // Tạo tab mới
        const page = await context.newPage();
        console.log('🔄 Đã tạo tab mới');

        // Mở trang web
        console.log('🌍 Đang mở trang sách...');
        await page.goto(targetUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000 // Không giới hạn thời gian tải
        });
        // await page.waitForSelector('[data-testid="active-notifications"]', { timeout: 10000 });
        // Đợi 10 giây để đảm bảo trang đã tải xong
        await page.waitForTimeout(5000); // Đợi thêm 2 giây để nội dung tải
        console.log('✅ Đã mở trang thành công');

        console.log('🔍 10s để chọn trang bắt đầu: ');
        await page.waitForTimeout(10000); // Đợi 10 giây để người dùng chọn trang bắt đầu

        let allContent = '';
        let pageNumber = 1;

        clearOutputFile();
        while (true) {
            try {
                console.log(`\n📖 Đang đọc trang ${pageNumber}...`);
                await page.waitForTimeout(2000); // Đợi nội dung tải
                // Kiểm tra và sao chép nội dung
                const content = await page.evaluate(() => {
                    const bookContent = document.querySelector('[data-testid="book-content"]') || 
                                     document.querySelector('main') || 
                                     document.body;
                    console.log(document.body.innerText.split('\n').slice(9, -9).join('\n'));
                    
                    if (!bookContent) return null;

                    const text = bookContent.innerText || bookContent.textContent;
                    if (!text) return null;

                    const lines = text.split('\n')
                        .filter(line => line.trim())
                        .filter(line => !line.includes('Currently Reading:'))
                        .filter(line => !line.includes('Previous Page'))
                        .filter(line => !line.includes('Next Page'))
                        .filter(line => !line.includes('Loading'));

                    return lines.join('\n');
                });

                if (!content) {
                    console.log('⚠️ Không tìm thấy nội dung trên trang');
                    await page.screenshot({ path: `error-page-${pageNumber}.png` });
                    break;
                }

                if (pageNumber > iterations || content === prevContentPage) {
                    console.log('📚 Đã đến trang cuối');
                    break;
                }
                prevContentPage = content;

                console.log(`📝 Đã sao chép ${content.length} ký tự`);
                allContent += content + '\n';

                // Tìm và click nút Next
                // const hasNextPage = await page.evaluate(() => {
                //     const nextButton = document.querySelector(".icon.page_arrow.icon-ic_back_arrow");
                //     console.log('nextButton', nextButton);
                //     if (nextButton && !nextButton.disabled) {
                //         nextButton.click();
                //         return true;
                //     }
                //     return false;
                // });
                await page.keyboard.press('ArrowRight');
                console.log('⏭️ Chuyển trang tiếp theo');
                pageNumber++;
                
                // Đợi chuyển trang
                await page.waitForTimeout(1500);

            } catch (error) {
                console.error('❌ Lỗi:', error);
                await page.screenshot({ path: `error-page-${pageNumber}.png` });
                break;
            }
        }

        // Lưu nội dung
        if (allContent.trim()) {
            console.log('\n💾 Đang lưu nội dung...');
            fs.writeFileSync(outputFile, allContent.trim(), 'utf-8');
            console.log(`✅ Đã lưu vào ${outputFile}`);
        } else {
            console.log('⚠️ Không có nội dung để lưu');
        }

        // Đóng trình duyệt
        console.log('👋 Đang đóng trình duyệt...');
        await context.close();
        console.log('✨ Hoàn thành!');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    }
})();
