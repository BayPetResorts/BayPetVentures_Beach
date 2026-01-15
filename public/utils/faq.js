// FAQ Dropdown Functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const faqAnswer = faqItem.querySelector('.faq-answer');
            const arrow = this.querySelector('.faq-arrow');
            
            const isActive = faqItem.classList.contains('active');
            
            // Close all other items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    const otherAnswer = item.querySelector('.faq-answer');
                    const otherArrow = item.querySelector('.faq-arrow');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = null;
                    }
                    if (otherArrow) {
                        otherArrow.style.transform = 'rotate(0deg)';
                    }
                }
            });
            
            // Toggle current item
            if (isActive) {
                faqItem.classList.remove('active');
                faqAnswer.style.maxHeight = null;
                arrow.style.transform = 'rotate(0deg)';
            } else {
                faqItem.classList.add('active');
                faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
                arrow.style.transform = 'rotate(180deg)';
            }
        });
    });
});

