document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const resultsContainer = document.getElementById('results-container');

    const ASYMMETRY_RECOMMENDATION_HTML = "Focus your efforts on the weaker side. Assess the innervation of the corresponding spinal segments, evaluate the activation and function of adjacent muscles, strengthen weakened muscles, and relieve muscle spasms or tension.<br><br><b>Recommendation:</b> Consultation with an osteopath or personal trainer is recommended to establish a foundation for health, safely improve results, and prevent injuries.";
    const ASYMMETRY_RECOMMENDATION_TEXT = "Focus your efforts on the weaker side. Assess the innervation of the corresponding spinal segments, evaluate the activation and function of adjacent muscles, strengthen weakened muscles, and relieve muscle spasms or tension.\n\n*Recommendation:* Consultation with an osteopath or personal trainer is recommended to establish a foundation for health, safely improve results, and prevent injuries.";

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateInputs()) {
            const results = calculateAllResults();
            displayResults(results);
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Please fill in all required fields with valid numbers before calculating.');
        }
    });

    function validateInputs() {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.classList.remove('input-error');
            if (!input.value || (input.type === 'number' && isNaN(parseFloat(input.value)))) {
                isValid = false;
                input.classList.add('input-error');
            }
        });
        return isValid;
    }

    // --- HELPER FUNCTIONS ---
    const checkAsymmetry = (right, left, thresholdPercent) => ({ isAsymmetric: Math.abs(right - left) / Math.max(right, left, 1) * 100 > thresholdPercent });
    const getOverallDescription = (score) => {
        if (score >= 90) return "Excellent! Your physical form is optimal.";
        if (score >= 70) return "Good! You've made significant progress.";
        if (score >= 40) return "Needs Improvement. There is potential for growth.";
        return "Minimal. Efforts are needed for improvement.";
    };

    // --- MAIN CALCULATION LOGIC ---
    function calculateAllResults() {
        const results = {};
        const getVal = (id) => parseFloat(document.getElementById(id).value);
        results.test1 = calculateCardioEndurance(getVal('test1-stange'));
        results.test2 = calculateStrength(getVal('test2-right'), getVal('test2-left'), document.getElementById('test2-gender').value);
        results.test3 = calculateCardioPulse(getVal('test3-pulse'));
        results.test4a = calculateFlexibilityLegs(getVal('test4a-legs'));
        results.test4b = calculateFlexibilityArms(getVal('test4b-right'), getVal('test4b-left'));
        results.test5 = calculateBalance(getVal('test5-right'), getVal('test5-left'));

        const scores = [results.test1.score, results.test2.score, results.test3.score, results.test4a.score, results.test4b.score, results.test5.score];
        results.overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        results.overallDescription = getOverallDescription(results.overallScore);
        return results;
    }

    // --- INDIVIDUAL TEST CALCULATORS (WITH FINAL UPDATED THRESHOLDS) ---

    function calculateCardioEndurance(val) {
        let result;
        if (val >= 91) result = { score: 100, title: "Excellent (100%)", detail: "Excellent cardiorespiratory endurance. All types of activities are suitable for further training. Keep it up and maintain a high level of physical activity to preserve excellent shape.", recommendation: null };
        else if (val >= 61) result = { score: 75, title: "Good (75%)", detail: "Excellent result at this level. To continue improvements, add yoga, functional exercises, and TRX training for comprehensive body work and improved flexibility.", recommendation: null };
        else if (val >= 41) result = { score: 50, title: "Average (50%)", detail: "Initial level of cardiorespiratory endurance. For further progress, add breathing practices and endurance training, as well as start working with interval cardio sessions to increase endurance with heart rate control.", recommendation: "It is recommended to consult an osteopath or personal trainer to safely improve results." };
        else result = { score: 25, title: "Minimal (25%)", detail: "If values are below 30 seconds, it may indicate high stress, body inflammation, and low endurance levels; it is necessary to improve overall health. It is recommended to focus on increasing general physical fitness and including Cardio regular loads and breathing practices.", recommendation: "Consultation with an osteopath or personal trainer is recommended to build a strong foundation for health, safely improve results, and prevent injuries." };
        return { ...result, value: `${val}s` };
    }

    function calculateStrength(rightVal, leftVal, gender) {
        const getResult = (value, g) => {
            const T = (g === 'male') ? { exc: 61, good: 46, avg: 36 } : { exc: 31, good: 26, avg: 21 };
            if (value >= T.exc) return { score: 100, title: "Excellent (100%)", detail: "Excellent result! All types of activities are suitable for further physical fitness improvement. Maintain a high level of training, and continue developing your skills.", recommendation: null };
            if (value >= T.good) return { score: 75, title: "Good (75%)", detail: "Good result, however it can be improved with gym, TRX and functional exercises. This will help develop strength, endurance, and improve overall physical fitness.", recommendation: null };
            if (value >= T.avg) return { score: 50, title: "Average (50%)", detail: "Add strength training and learn to activate muscles more effectively. Work on engaging all muscle groups to improve results and progress.", recommendation: "It is recommended to consult an osteopath or personal trainer to safely improve results." };
            return { score: 25, title: "Minimal (25%)", detail: "Focus on muscle activation, functional, strength training, and myofascial release to relieve spasms, with an emphasis on relieving tension in the arms, neck, and trapezius muscles to prevent injuries and enhance performance.", recommendation: "Consultation with an osteopath or personal trainer is recommended to build a strong foundation for health, safely improve results, and prevent injuries." };
        };

        const asymmetryInfo = checkAsymmetry(rightVal, leftVal, 10);
        const right = getResult(rightVal, gender);
        const left = getResult(leftVal, gender);
        const commonData = { value: `R: ${rightVal}kg, L: ${leftVal}kg`, score: (right.score + left.score) / 2 };

        if (!asymmetryInfo.isAsymmetric) {
            const avgResult = getResult((rightVal + leftVal) / 2, gender);
            return { ...commonData, ...avgResult, asymmetry: false };
        } else {
            return { ...commonData, right, left, asymmetry: true };
        }
    }
    
    function calculateCardioPulse(val) {
        const pulseMap = { 95: '90-100%', 85: '80-90%', 65: '60-70%', 55: '50-60%' };
        let result;
        if (val <= 60) result = { score: 100, title: "Excellent (100%)", detail: "The heart’s response to load is excellent, you can increase the complexity of workouts. The body is well prepared and effectively handles loads without signs of overfatigue. Excellent adaptation allows for workouts without restrictions, but it is recommended to monitor the pulse in particularly complex workouts to ensure safety.", recommendation: null };
        else if (val <= 70) result = { score: 75, title: "Good (75%)", detail: "The heart’s response to load is very good, the body is well prepared and effectively handles loads without signs of overfatigue. Good adaptation allows for intense workouts and practices without significant restrictions, but always consider individual sensations.", recommendation: null };
        else if (val <= 90) result = { score: 50, title: "Average (50%)", detail: "The pulse response to load is average, indicating insufficient adaptation for more intense workouts. Need to improve adaptation and expand the program by adding endurance training, including resistance band exercises, cardio, breathing exercises, and TRX. Integrate more cardio and functional training for further progress.", recommendation: "It is recommended to consult an osteopath or personal trainer to safely improve results." };
        else result = { score: 25, title: "Minimal (25%)", detail: "The pulse response to load is elevated, which may indicate the need for additional attention to overall health and the cardiovascular system. It is recommended to carefully monitor the pulse during all intense workouts to avoid overloads. Include breathing exercises for improved recovery and light cardio sessions for gradual adaptation.", recommendation: "Consultation with an osteopath or personal trainer is recommended to build a strong foundation for health, safely improve results, and prevent injuries." };
        return { ...result, value: `Zone ${pulseMap[val] || 'N/A'}` };
    }
    
    function calculateFlexibilityLegs(val) {
        const textMap = { 25: 'Reach to knee', 50: 'Reach to shin/foot', 75: 'Reach to floor (fists)', 100: 'Reach to floor (palms)' };
        let result;
        if (val === 100) result = { score: 100, title: "Excellent (100%)", detail: "Excellent flexibility! Keep it up. If there is hypermobility, it is recommended to additionally strengthen muscles to maintain stability and prevent injuries.", recommendation: null };
        else if (val === 75) result = { score: 75, title: "Good (75%)", detail: "Continue developing flexibility byadding more complex stretching workouts and functional exercises to improve mobility and strengthen muscles.", recommendation: null };
        else if (val === 50) result = { score: 50, title: "Average (50%)", detail: "It is recommended to include practices for relieving muscle clamps and injury prevention: myofascial release (MFR), massage, yoga, and somatic methods to increase flexibility and mobility.", recommendation: "It is recommended to consult an osteopath or personal trainer to safely improve results." };
        else result = { score: 25, title: "Minimal (25%)", detail: "Possible issues with posture, innervation, or past legs injuries. Regular massage, basic stretching exercises, and gentle yoga are recommended to enhance flexibility and relieve muscle tension.", recommendation: "Consultation with an osteopath or personal trainer is recommended to build a strong foundation for health, safely improve results, and prevent injuries." };
        return { ...result, value: textMap[val] };
    }

    function calculateFlexibilityArms(rightVal, leftVal) {
        const getResult = (value) => {
            if (value >= 100) return { score: 100, title: "Excellent (100%)", detail: "Excellent flexibility and neuromuscular coordination. Maintain your current routine and include controlled strength and mobility training. If hypermobility is present, additional muscle strengthening is recommended to ensure stability and prevent injuries.", recommendation: null };
            if (value >= 75) return { score: 75, title: "Good (75%)", detail: "You demonstrate good shoulder mobility and flexibility. Continue improving by incorporating functional training (e.g., TRX, yoga) and more advanced flexibility exercises while maintaining safe technique.", recommendation: null };
            if (value >= 50) return { score: 50, title: "Average (50%)", detail: "Incorporate myofascial release (MFR), massage, yoga, and exercises to relieve muscle tension and activate stabilizing muscles. This will enhance flexibility and help prevent injuries.", recommendation: "It is recommended to consult an osteopath or personal trainer to safely improve results." };
            return { score: 25, title: "Minimal (25%)", detail: "Possible issues with posture, innervation, or past shoulder injuries. Regular massage, basic stretching exercises, gentle yoga, and gentle mobility work will help restore range of motion and reduce muscle tension.", recommendation: "Consultation with an osteopath or personal trainer is recommended to build a strong foundation for health, safely improve results, and prevent injuries." };
        };
        const valueMap = { 25: "Fingers do not touch", 50: "Fingers touch but do not clasp", 75: "Fingers form a weak clasp", 100: "Fingers form a strong, full clasp" };
        const asymmetryInfo = checkAsymmetry(rightVal, leftVal, 25);
        const right = getResult(rightVal);
        const left = getResult(leftVal);
        const commonData = { value: `R: ${valueMap[rightVal]}, L: ${valueMap[leftVal]}`, score: (right.score + left.score) / 2 };

        if (!asymmetryInfo.isAsymmetric) {
            const avgResult = getResult((rightVal + leftVal) / 2);
            return { ...commonData, ...avgResult, asymmetry: false };
        } else {
            return { ...commonData, right, left, asymmetry: true };
        }
    }

    function calculateBalance(rightVal, leftVal) {
        const getResult = (value) => {
            if (value >= 51) return { score: 100, title: "Excellent (100%)", detail: "Your balance is at the highest level! All types of activities are suitable. Maintain this level and continue training to improve stabilization.", recommendation: null };
            if (value >= 41) return { score: 75, title: "Good (75%)", detail: "Excellent result, you can move to more complex training programs. Add more complex yoga and TRX for further strengthening of muscles and improvement of balance.", recommendation: null };
            if (value >= 31) return { score: 50, title: "Average (50%)", detail: "For further progress, add balance exercises, as well as work with stabilizer muscles to improve coordination and maintain stability.", recommendation: "It is recommended to consult an osteopath or personal trainer to safely improve results." };
            return { score: 25, title: "Minimal (25%)", detail: "It is recommended to consult an osteopath or personal trainer to check the function of the leg and foot muscles. Focus on stabilizing and activating the muscles in the feet, toes, and shins to relieve spasms. Incorporating yoga can further enhance balance and strengthen muscles.", recommendation: "Consulting an osteopath or personal trainer is advised to build a solid foundation for health, safely improve results, and prevent injuries." };
        };
        const asymmetryInfo = checkAsymmetry(rightVal, leftVal, 10);
        const right = getResult(rightVal);
        const left = getResult(leftVal);
        const commonData = { value: `R: ${rightVal}s, L: ${leftVal}s`, score: (right.score + left.score) / 2 };

        if (!asymmetryInfo.isAsymmetric) {
            const avgResult = getResult((rightVal + leftVal) / 2);
            return { ...commonData, ...avgResult, asymmetry: false };
        } else {
            return { ...commonData, right, left, asymmetry: true };
        }
    }

    // --- DISPLAY LOGIC ---
    function displayResults(r) {
        resultsContainer.classList.remove('hidden');

        const renderRecommendation = (recData) => {
            let html = `<p><b>${recData.title}</b></p>`;
            html += `<p>${recData.detail}</p>`;
            if (recData.recommendation) {
                html += `<p><b>Recommendation:</b> ${recData.recommendation}</p>`;
            }
            return html;
        };
        
        let content = `
            <h2>📑 Your Results and Recommendations</h2>
            <div class="summary-header">
                <div class="infographic-circle" style="--p:${r.overallScore.toFixed(0)};">${r.overallScore.toFixed(0)}%</div>
                <div class="overall-result"><h3>Overall Rating</h3><div class="overall-description">${r.overallDescription}</div></div>
            </div>
            <table class="results-table">
                <thead><tr><th>Test</th><th>Entered Data</th><th>Final Score</th></tr></thead>
                <tbody>
                    <tr><td>1. Cardiorespiratory Endurance</td><td>${r.test1.value}</td><td>${r.test1.score.toFixed(1)}%</td></tr>
                    <tr><td>2. Strength</td><td>${r.test2.value} ${r.test2.asymmetry ? '<span class="asymmetry-flag">⚠️ Asymmetry</span>' : ''}</td><td>${r.test2.score.toFixed(1)}%</td></tr>
                    <tr><td>3. Muscle Endurance</td><td>${r.test3.value}</td><td>${r.test3.score.toFixed(1)}%</td></tr>
                    <tr><td>4a. Flexibility (Legs)</td><td>${r.test4a.value}</td><td>${r.test4a.score.toFixed(1)}%</td></tr>
                    <tr><td>4b. Flexibility (Arms/Shoulders)</td><td>${r.test4b.value} ${r.test4b.asymmetry ? '<span class="asymmetry-flag">⚠️ Asymmetry</span>' : ''}</td><td>${r.test4b.score.toFixed(1)}%</td></tr>
                    <tr><td>5. Balance</td><td>${r.test5.value} ${r.test5.asymmetry ? '<span class="asymmetry-flag">⚠️ Asymmetry</span>' : ''}</td><td>${r.test5.score.toFixed(1)}%</td></tr>
                </tbody>
            </table>
            <h2>💡 Detailed Recommendations</h2>`;

        const tests = [
            { id: 1, name: "Cardiorespiratory Endurance", data: r.test1 }, { id: 2, name: "Strength", data: r.test2 },
            { id: 3, name: "Muscle Endurance (Leg Swings)", data: r.test3 }, { id: '4a', name: "Flexibility (Legs)", data: r.test4a },
            { id: '4b', name: "Flexibility (Arms/Shoulders)", data: r.test4b }, { id: 5, name: "Balance", data: r.test5 }
        ];
        
        let asymmetricTests = [];
        tests.forEach(test => {
            content += `<div class="recommendation-card"><h3>Test ${test.id}: ${test.name}</h3>`;
            if (test.data.asymmetry) {
                asymmetricTests.push(test.id);
                content += `<div class="side-recommendation"><h4>Right Side Result</h4>${renderRecommendation(test.data.right)}</div>`;
                content += `<div class="side-recommendation"><h4>Left Side Result</h4>${renderRecommendation(test.data.left)}</div>`;
            } else {
                content += renderRecommendation(test.data);
            }
            content += `</div>`;
        });

        if (asymmetricTests.length > 0) {
            content += `<div class="final-asymmetry-warning"><b>Attention: Asymmetry in tests ${asymmetricTests.join(', ')}! ⚠️</b><p>${ASYMMETRY_RECOMMENDATION_HTML}</p></div>`;
        }

        content += `<a href="${generateWhatsAppLink(r)}" target="_blank" class="whatsapp-btn">Send Results via WhatsApp 📤</a>`;
        resultsContainer.innerHTML = content;
    }
    
    function generateWhatsAppLink(r) {
        // Build the basic message
        let message = `*Functional Test Results Summary* 🌟\n\n`;
        message += `*Overall Score: ${r.overallScore.toFixed(1)}%* (${r.overallDescription})\n\n`;
        message += `*Detailed Scores:*\n`;
        message += `1. Cardio Endurance: ${r.test1.score.toFixed(1)}%\n`;
        message += `2. Strength: ${r.test2.score.toFixed(1)}% ${r.test2.asymmetry ? '(Asymmetry!)' : ''}\n`;
        message += `3. Muscle Endurance: ${r.test3.score.toFixed(1)}%\n`;
        message += `4a. Flex (Legs): ${r.test4a.score.toFixed(1)}%\n`;
        message += `4b. Flex (Arms): ${r.test4b.score.toFixed(1)}% ${r.test4b.asymmetry ? '(Asymmetry!)' : ''}\n`;
        message += `5. Balance: ${r.test5.score.toFixed(1)}% ${r.test5.asymmetry ? '(Asymmetry!)' : ''}\n`;

        // Add the new "Key Insights" section
        message += `\n*Key Insights & Recommendations* 💡\n\n`;

        const allTests = [
            { name: "Cardiorespiratory Endurance", data: r.test1 },
            { name: "Strength", data: r.test2 },
            { name: "Muscle Endurance", data: r.test3 },
            { name: "Flexibility (Legs)", data: r.test4a },
            { name: "Flexibility (Arms/Shoulders)", data: r.test4b },
            { name: "Balance", data: r.test5 }
        ];

        const hasAsymmetry = allTests.some(test => test.data.asymmetry);

        if (hasAsymmetry) {
            message += `*Primary Focus: Correcting Imbalance* ⚠️\n`;
            message += `Your results show a significant difference between your left and right sides. It is highly recommended to focus on this first.\n\n`;
            message += `*General Advice:*\n${ASYMMETRY_RECOMMENDATION_TEXT}`;
        } else {
            // Find the lowest scoring test if there is no asymmetry
            const lowestTest = allTests.reduce((min, current) => current.data.score < min.data.score ? current : min, allTests[0]);
            
            message += `*Primary Focus: ${lowestTest.name}*\n`;
            message += `This was your area with the most room for improvement. Focusing here will yield the greatest benefits.\n\n`;
            message += `*Recommendation for ${lowestTest.name}:*\n`;
            message += `*${lowestTest.data.title}*: ${lowestTest.data.detail.replace(/<br>/g, "\n")}`;
            if (lowestTest.data.recommendation) {
                message += `\n\n*Next Step:* ${lowestTest.data.recommendation}`;
            }
        }

        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    }
});