const gradientText = document.getElementById('GradientText');
const gradientButton = document.getElementById('GradientButton');

window.addEventListener("load", () => {
    if (getThemeID() == -1) {
        console.log("new param")
        return;
    }

    console.log("modify param")
})

function getThemeID() {
    return window.location.href.split("=")[1];
}

document.addEventListener('DOMContentLoaded', () => {
    changeLanguage();  
});

gradientButton.addEventListener('click', () => {
    chrome.storage.local.get('customGradientList', function (result) {
        const customGradientList = result.customGradientList !== undefined ? result.customGradientList : [];
        
        //customGradientList.push(`linear-gradient(0deg, ${gradientText.value} 0%, ${gradientText.value})`);
        customGradientList.push(gradientText.value)

        chrome.storage.local.set({ customGradientList: customGradientList });
        chrome.storage.local.set({ colorTheme: `custom-${customGradientList.length}` });

        console.log(customGradientList)
    });
});
