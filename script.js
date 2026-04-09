// Утилиты для работы с цветами
const ColorUtils = {
    // Конвертация HSL в RGB
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const k = n => (n + h * 12) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        
        return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
    },
    
    // Конвертация RGB в HSL
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    },
    
    // Конвертация RGB в HEX
    rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    },
    
    // Генерация случайного HSL цвета
    randomHsl() {
        return [Math.floor(Math.random() * 360), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)];
    },
    
    // Расчет цветовых гармоний
    getHarmonyColors(baseHue, harmonyType, count) {
        const colors = [];
        let step;
        
        switch (harmonyType) {
            case 'analogous':
                step = 30;
                break;
            case 'triadic':
                step = 120;
                break;
            case 'tetradic':
                step = 60;
                break;
            case 'complementary':
                step = 180;
                break;
            default:
                step = 45;
        }
        
        for (let i = 0; i < count; i++) {
            const hue = (baseHue + (i * step)) % 360;
            colors.push(hue);
        }
        
        return colors;
    },
    
    // Расчет яркости для контраста
    getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },
    
    // Расчет коэффициента контраста
    getContrastRatio(color1, color2) {
        const lum1 = this.getLuminance(...color1);
        const lum2 = this.getLuminance(...color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }
};

// Генератор палитр
class PaletteGenerator {
    constructor() {
        this.currentPalette = [];
        this.selectedColorIndex = null;
    }
    
    generatePalette(preferences) {
        const { mood, temperature, seasons, size, effects } = preferences;
        
        // Расчет базового оттенка на основе предпочтений
        let baseHue = this.getBaseHue(temperature, seasons);
        let saturation = this.getSaturation(mood, effects);
        let lightness = this.getLightness(mood, effects);
        
        // Генерация цветов на основе гармонии
        const harmonyType = this.getHarmonyType(mood, size);
        const hueVariations = ColorUtils.getHarmonyColors(baseHue, harmonyType, parseInt(size));
        
        const colors = [];
        
        hueVariations.forEach((hue, index) => {
            // Регулировка насыщенности и светлоты для вариаций
            let currentSat = saturation;
            let currentLight = lightness;
            
            // Создание вариаций в палитре
            if (index === 0) {
                // Базовый цвет
                currentSat = saturation;
                currentLight = lightness;
            } else if (index === 1) {
                // Акцентный цвет - больше насыщенности
                currentSat = Math.min(100, saturation + 20);
                currentLight = Math.min(90, lightness + 10);
            } else if (index === 2) {
                // Комплементарный - другая светлота
                currentSat = Math.max(20, saturation - 10);
                currentLight = Math.max(10, lightness - 10);
            } else {
                // Дополнительные цвета
                currentSat = Math.max(30, saturation - (index * 5));
                currentLight = Math.min(95, lightness + (index * 5));
            }
            
            // Применение эффектов
            if (effects.includes('pastel')) {
                currentSat = Math.max(20, currentSat - 30);
                currentLight = Math.min(95, currentLight + 15);
            }
            
            const rgb = ColorUtils.hslToRgb(hue, currentSat, currentLight);
            const hex = ColorUtils.rgbToHex(...rgb);
            
            colors.push({
                hex: hex,
                hsl: [hue, currentSat, currentLight],
                rgb: rgb,
                name: this.getColorName(hue, currentSat, currentLight)
            });
        });
        
        this.currentPalette = colors;
        return colors;
    }
    
    getBaseHue(temperature, seasons) {
        // Выбор базового оттенка на основе температуры и сезонов
        if (temperature === 'cool') {
            return Math.floor(Math.random() * 120) + 180; // Синие и зеленые
        } else if (temperature === 'warm') {
            return Math.floor(Math.random() * 120); // Красные и желтые
        } else {
            // Нейтральный - сбалансированный по спектру
            return Math.floor(Math.random() * 360);
        }
    }
    
    getSaturation(mood, effects) {
        let baseSat = 60; // По умолчанию
        
        switch (mood) {
            case 'calm':
                baseSat = 40;
                break;
            case 'vibrant':
                baseSat = 80;
                break;
            case 'muted':
                baseSat = 30;
                break;
            case 'bold':
                baseSat = 90;
                break;
        }
        
        if (effects.includes('pastel')) {
            baseSat = Math.max(20, baseSat - 30);
        }
        
        return baseSat;
    }
    
    getLightness(mood, effects) {
        let baseLight = 50; // По умолчанию
        
        switch (mood) {
            case 'calm':
                baseLight = 60;
                break;
            case 'vibrant':
                baseLight = 50;
                break;
            case 'muted':
                baseLight = 40;
                break;
            case 'bold':
                baseLight = 45;
                break;
        }
        
        if (effects.includes('pastel')) {
            baseLight = Math.min(90, baseLight + 20);
        }
        
        return baseLight;
    }
    
    getHarmonyType(mood, size) {
        if (size === '3') return 'triadic';
        if (size === '5') return 'analogous';
        if (size === '7') return 'tetradic';
        
        // По умолчанию на основе настроения
        switch (mood) {
            case 'calm': return 'analogous';
            case 'vibrant': return 'complementary';
            case 'muted': return 'analogous';
            case 'bold': return 'complementary';
            default: return 'analogous';
        }
    }
    
    getColorName(h, s, l) {
        // Простое именование цветов на основе значений HSL
        const hueNames = [
            'Красный', 'Красно-оранжевый', 'Оранжевый', 'Желто-оранжевый', 'Желтый', 
            'Желто-зеленый', 'Зеленый', 'Сине-зеленый', 'Синий', 'Сине-фиолетовый', 
            'Фиолетовый', 'Красно-фиолетовый'
        ];
        
        const hueIndex = Math.floor(h / 30);
        const hueName = hueNames[hueIndex % 12];
        
        let saturationName = '';
        if (s < 30) saturationName = 'Серый';
        else if (s < 60) saturationName = 'Приглушенный';
        else saturationName = 'Яркий';
        
        let lightnessName = '';
        if (l < 30) lightnessName = 'Темный';
        else if (l < 70) lightnessName = 'Средний';
        else lightnessName = 'Светлый';
        
        return `${lightnessName} ${saturationName} ${hueName}`;
    }
    
    randomizePalette() {
        if (this.currentPalette.length === 0) return this.generatePalette(this.getCurrentPreferences());
        
        // Немного рандомизировать существующую палитру
        const newPalette = this.currentPalette.map(color => {
            const [h, s, l] = color.hsl;
            const newH = (h + Math.floor(Math.random() * 20) - 10 + 360) % 360;
            const newS = Math.max(10, Math.min(100, s + Math.floor(Math.random() * 20) - 10));
            const newL = Math.max(10, Math.min(90, l + Math.floor(Math.random() * 20) - 10));
            
            const rgb = ColorUtils.hslToRgb(newH, newS, newL);
            const hex = ColorUtils.rgbToHex(...rgb);
            
            return {
                hex: hex,
                hsl: [newH, newS, newL],
                rgb: rgb,
                name: this.getColorName(newH, newS, newL)
            };
        });
        
        this.currentPalette = newPalette;
        return newPalette;
    }
    
    getCurrentPreferences() {
        const form = document.getElementById('preferences-form');
        const mood = form.querySelector('input[name="mood"]:checked').value;
        const temperature = form.querySelector('input[name="temperature"]:checked').value;
        const size = form.querySelector('input[name="size"]:checked').value;
        
        const seasons = Array.from(form.querySelectorAll('input[name="season"]:checked')).map(cb => cb.value);
        const effects = Array.from(form.querySelectorAll('input[name="effects"]:checked')).map(cb => cb.value);
        
        return { mood, temperature, seasons, size, effects };
    }
}

// Контроллер интерфейса
class UIController {
    constructor() {
        this.generator = new PaletteGenerator();
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.generateDefaultPalette();
    }
    
    bindEvents() {
        const form = document.getElementById('preferences-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateNewPalette();
        });
        
        document.getElementById('randomize-btn').addEventListener('click', () => {
            this.randomizePalette();
        });
        
        document.getElementById('copy-btn').addEventListener('click', () => {
            this.copyColors();
        });
        
        document.getElementById('save-btn').addEventListener('click', () => {
            this.savePalette();
        });
    }
    
    generateDefaultPalette() {
        const defaultPreferences = {
            mood: 'calm',
            temperature: 'cool',
            seasons: [],
            size: '5',
            effects: []
        };
        
        const palette = this.generator.generatePalette(defaultPreferences);
        this.renderPalette(palette);
        this.updatePaletteInfo(palette);
    }
    
    generateNewPalette() {
        const preferences = this.generator.getCurrentPreferences();
        const palette = this.generator.generatePalette(preferences);
        this.renderPalette(palette);
        this.updatePaletteInfo(palette);
    }
    
    randomizePalette() {
        const palette = this.generator.randomizePalette();
        this.renderPalette(palette);
        this.updatePaletteInfo(palette);
    }
    
    renderPalette(palette) {
        const container = document.getElementById('color-palette');
        container.innerHTML = '';
        
        palette.forEach((color, index) => {
            const colorCard = document.createElement('div');
            colorCard.className = 'color-card';
            colorCard.onclick = () => this.selectColor(index);
            
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color.hex;
            
            const hexDisplay = document.createElement('div');
            hexDisplay.className = 'color-hex';
            hexDisplay.textContent = color.hex;
            
            swatch.appendChild(hexDisplay);
            colorCard.appendChild(swatch);
            
            container.appendChild(colorCard);
        });
    }
    
    selectColor(index) {
        // Удалить предыдущий выбор
        document.querySelectorAll('.color-card').forEach(card => card.classList.remove('selected'));
        
        // Добавить выбор к нажатой карточке
        const cards = document.querySelectorAll('.color-card');
        if (cards[index]) {
            cards[index].classList.add('selected');
            this.generator.selectedColorIndex = index;
            this.updateColorDetails(this.generator.currentPalette[index]);
        }
    }
    
    updateColorDetails(color) {
        const container = document.getElementById('color-details-content');
        container.innerHTML = `
            <div class="color-detail-item">
                <span>Название:</span>
                <span>${color.name}</span>
            </div>
            <div class="color-detail-item">
                <span>HEX:</span>
                <span>${color.hex}</span>
            </div>
            <div class="color-detail-item">
                <span>RGB:</span>
                <span>rgb(${color.rgb.join(', ')})</span>
            </div>
            <div class="color-detail-item">
                <span>HSL:</span>
                <span>hsl(${color.hsl[0]}, ${color.hsl[1]}%, ${color.hsl[2]}%)</span>
            </div>
        `;
    }
    
    updatePaletteInfo(palette) {
        const container = document.getElementById('palette-info-content');
        
        // Рассчитать статистику палитры
        const avgSaturation = Math.round(palette.reduce((sum, color) => sum + color.hsl[1], 0) / palette.length);
        const avgLightness = Math.round(palette.reduce((sum, color) => sum + color.hsl[2], 0) / palette.length);
        
        // Найти наиболее и наименее насыщенные цвета
        const mostSaturated = palette.reduce((prev, curr) => prev.hsl[1] > curr.hsl[1] ? prev : curr);
        const leastSaturated = palette.reduce((prev, curr) => prev.hsl[1] < curr.hsl[1] ? prev : curr);
        
        container.innerHTML = `
            <div class="color-detail-item">
                <span>Размер палитры:</span>
                <span>${palette.length} цветов</span>
            </div>
            <div class="color-detail-item">
                <span>Средняя насыщенность:</span>
                <span>${avgSaturation}%</span>
            </div>
            <div class="color-detail-item">
                <span>Средняя светлота:</span>
                <span>${avgLightness}%</span>
            </div>
            <div class="color-detail-item">
                <span>Наиболее насыщенный:</span>
                <span>${mostSaturated.name}</span>
            </div>
            <div class="color-detail-item">
                <span>Наименее насыщенный:</span>
                <span>${leastSaturated.name}</span>
            </div>
        `;
    }
    
    copyColors() {
        const colors = this.generator.currentPalette.map(c => c.hex).join(', ');
        navigator.clipboard.writeText(colors).then(() => {
            this.showSuccessMessage('Цвета скопированы в буфер обмена!');
        });
    }
    
    savePalette() {
        const palette = {
            colors: this.generator.currentPalette,
            preferences: this.generator.getCurrentPreferences(),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(palette, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `palette-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage('Палитра успешно сохранена!');
    }
    
    showSuccessMessage(message) {
        // Удалить существующее сообщение об успехе, если есть
        const existing = document.querySelector('.success-message');
        if (existing) existing.remove();
        
        const msg = document.createElement('div');
        msg.className = 'success-message';
        msg.textContent = message;
        msg.style.display = 'block';
        
        document.querySelector('.palette-display').appendChild(msg);
        
        setTimeout(() => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 300);
        }, 2000);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new UIController();
});
