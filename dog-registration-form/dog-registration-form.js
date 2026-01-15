/**
 * Dog Registration Form - Composable Module
 * 
 * Usage:
 *   const form = new DogRegistrationForm({
 *     apiEndpoint: '/api/contact',
 *     dogIconUrl: '/path/to/dog-icon.png',
 *     successImageUrl: '/path/to/success-image.jpg',
 *     onSuccess: (data) => { console.log('Success!', data); },
 *     onError: (error) => { console.error('Error!', error); }
 *   });
 *   form.init();
 */

(function(global) {
    'use strict';

    // Constants
    const TOTAL_STEPS = 3;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const MIN_PHONE_LENGTH = 10;
    
    // Conversion value per registration (lead value)
    // This represents the value of a lead, not the service price
    // Calculation: Service Price ($200) × Conversion Rate (20%) = $40 per lead
    const DEFAULT_CONVERSION_VALUE = 40.00;
    
    // Breed list
    const BREED_LIST = [
        'Mixed Breed (Mutt)',
        'Affenpinscher', 'Afghan Hound', 'Akita', 'Alaskan Malamute',
        'American English Coonhound', 'American Eskimo Dog', 'American Hairless Terrier',
        'American Staffordshire Terrier', 'American Water Spaniel', 'Anatolian Shepherd Dog',
        'Australian Cattle Dog', 'Australian Shepherd', 'Australian Terrier', 'Azawakh',
        'Barbet', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Beauceron', 'Bedlington Terrier',
        'Belgian Laekenois', 'Belgian Malinois', 'Belgian Sheepdog', 'Belgian Tervuren',
        'Bergamasco Sheepdog', 'Bernedoodle', 'Bernese Mountain Dog', 'Bichon Frise',
        'Biewer Terrier', 'Black and Tan Coonhound', 'Black Russian Terrier', 'Bloodhound',
        'Bluetick Coonhound', 'Boerboel', 'Border Collie', 'Border Terrier', 'Borzoi',
        'Boston Terrier', 'Bouvier des Flandres', 'Boxer', 'Boykin Spaniel', 'Bracco Italiano',
        'Briard', 'Brittany', 'Brussels Griffon', 'Bulldog', 'Bullmastiff', 'Bull Terrier',
        'Cairn Terrier', 'Cane Corso', 'Canaan Dog', 'Cardigan Welsh Corgi',
        'Cavalier King Charles Spaniel', 'Cesky Terrier', 'Chesapeake Bay Retriever',
        'Chihuahua', 'Chinese Crested', 'Chinese Shar-Pei', 'Chinook', 'Chow Chow',
        'Cirneco dell\'Etna', 'Clumber Spaniel', 'Cockapoo', 'Cocker Spaniel', 'Coton de Tulear',
        'Dachshund', 'Dalmation', 'Dandie Dinmont Terrier', 'Doberman Pinscher',
        'Dogues de Bordeaux', 'English Cocker Spaniel', 'English Foxhound',
        'English Springer Spaniel', 'English Toy Spaniel', 'Entlebucher Mountain Dog',
        'Estrela Mountain Dog', 'Field Spaniel', 'Finnish Lapphund', 'Finnish Spitz',
        'Flat-Coated Retriever', 'Fox Terrier (Smooth)', 'Fox Terrier (Wire)', 'French Bulldog',
        'German Pinscher', 'German Shepherd Dog', 'German Shorthaired Pointer', 'Giant Schnauzer',
        'Glen of Imaal Terrier', 'Golden Retriever', 'Goldendoodle', 'Gordon Setter',
        'Grand Basset Griffon Vendéen', 'Great Dane', 'Great Pyrenees', 'Greater Swiss Mountain Dog',
        'Greyhound', 'Harrier', 'Havanese', 'Hokkaido', 'Ibizan Hound', 'Iceland Sheepdog',
        'Irish Red and White Setter', 'Irish Setter', 'Irish Terrier', 'Irish Wolfhound',
        'Italian Greyhound', 'Japanese Chin', 'Keeshond', 'Kerry Blue Terrier', 'Komondor', 'Kuvasz',
        'Labradoodle', 'Labrador Retriever', 'Lagotto Romagnolo', 'Lakeland Terrier',
        'Lancashire Heeler', 'Leonberger', 'Lhasa Apso', 'Lowchen', 'Maltipoo', 'Manchester Terrier',
        'Mastiff', 'Miniature American Shepherd', 'Miniature Pinscher', 'Miniature Schnauzer', 'Mudi',
        'Neapolitan Mastiff', 'Nederlandse Kooikerhondje', 'Newfoundland', 'Norfolk Terrier',
        'Norwegian Buhund', 'Norwegian Elkhound', 'Norwegian Lundehund',
        'Nova Scotia Duck Tolling Retriever', 'Old English Sheepdog', 'Otterhound',
        'Papillon', 'Parson Russell Terrier', 'Pekingese', 'Pembroke Welsh Corgi',
        'Peruvian Inca Orchid', 'Petit Basset Griffon Vendéen', 'Pharaoh Hound', 'Plott Hound',
        'Pointer', 'Polish Lowland Sheepdog', 'Pomeranian', 'Poodle', 'Portuguese Water Dog',
        'Pug', 'Puli', 'Pumi', 'Pyrenean Shepherd', 'Rat Terrier', 'Redbone Coonhound',
        'Rhodesian Ridgeback', 'Rottweiler', 'Russell Terrier', 'Russian Toy', 'Saluki', 'Samoyed',
        'Schipperke', 'Scottish Deerhound', 'Scottish Terrier', 'Sealyham Terrier',
        'Shetland Sheepdog', 'Shiba Inu', 'Shih Tzu', 'Siberian Husky', 'Silky Terrier',
        'Skye Terrier', 'Sloughi', 'Soft Coated Wheaten Terrier', 'Spanish Water Dog',
        'Spinone Italiano', 'Staffordshire Bull Terrier', 'Standard Schnauzer', 'St. Bernard',
        'Sussex Spaniel', 'Swedish Vallhund', 'Tibetan Mastiff', 'Tibetan Spaniel',
        'Tibetan Terrier', 'Toy Fox Terrier', 'Treeing Walker Coonhound', 'Vizsla', 'Weimaraner',
        'Welsh Springer Spaniel', 'Welsh Terrier', 'West Highland White Terrier', 'Whippet',
        'Wirehaired Pointing Griffon', 'Wirehaired Vizsla', 'Xoloitzcuintli', 'Yorkshire Terrier',
        'Other'
    ];

    /**
     * Dog Registration Form Class
     */
    function DogRegistrationForm(config = {}) {
        // Default configuration
        this.config = {
            apiEndpoint: config.apiEndpoint || '/api/contact',
            dogIconUrl: config.dogIconUrl || '',
            successImageUrl: config.successImageUrl || '',
            successTitle: config.successTitle || 'Thank You!',
            successMessage: config.successMessage || 'Your registration has been submitted successfully.',
            successSubmessage: config.successSubmessage || 'We\'ll be in touch with you soon.',
            successReturnUrl: config.successReturnUrl || '/',
            successReturnText: config.successReturnText || 'Return to Home',
            smsPolicyUrl: config.smsPolicyUrl || '#',
            smsDisclaimer: config.smsDisclaimer || null,
            formTitle: config.formTitle || 'Register Your Dog',
            autoScroll: config.autoScroll !== false, // Default true
            onSuccess: config.onSuccess || null,
            onError: config.onError || null,
            onStepChange: config.onStepChange || null,
            enableTracking: config.enableTracking !== false, // Default true
            trackingConfig: config.trackingConfig || {}
        };

        // State
        this.currentStep = 1;
        this.registrationStarted = false;
        this.formStartTime = null;

        // DOM Elements (will be set in init)
        this.contactForm = null;
        this.formMessage = null;
        this.successScreen = null;
        this.progressTrack = null;
    }

    /**
     * Initialize the form
     */
    DogRegistrationForm.prototype.init = function() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._initialize());
        } else {
            this._initialize();
        }
    };

    /**
     * Internal initialization
     */
    DogRegistrationForm.prototype._initialize = function() {
        // Get DOM elements
        this.contactForm = document.getElementById('contactForm');
        this.formMessage = document.getElementById('formMessage');
        this.successScreen = document.getElementById('successScreen');
        this.progressTrack = document.querySelector('.progress-track');

        if (!this.contactForm) {
            console.error('DogRegistrationForm: Form element with id "contactForm" not found');
            return;
        }

        // Update configurable elements
        this._updateConfigurableElements();

        // Initialize form
        this._initializeFormFields();
        this._initializeBreedDropdown();
        this._initializeVaccinationCards();
        this._attachEventListeners();

        // Auto-scroll if enabled
        if (this.config.autoScroll) {
            this._scrollToForm();
        }
    };

    /**
     * Update configurable elements with custom text/images
     */
    DogRegistrationForm.prototype._updateConfigurableElements = function() {
        // Form title
        const formTitle = document.getElementById('formTitle');
        if (formTitle) formTitle.textContent = this.config.formTitle;

        // Dog icon
        const dogIcon = document.getElementById('dogIcon');
        if (dogIcon && this.config.dogIconUrl) {
            dogIcon.src = this.config.dogIconUrl;
        }

        // Success screen
        const successTitle = document.getElementById('successTitle');
        if (successTitle) successTitle.textContent = this.config.successTitle;

        const successMessage = document.getElementById('successMessage');
        if (successMessage) successMessage.textContent = this.config.successMessage;

        const successSubmessage = document.getElementById('successSubmessage');
        if (successSubmessage) successSubmessage.textContent = this.config.successSubmessage;

        const successReturnLink = document.getElementById('successReturnLink');
        if (successReturnLink) {
            successReturnLink.href = this.config.successReturnUrl;
            successReturnLink.textContent = this.config.successReturnText;
        }

        const successImage = document.getElementById('successImage');
        const successImageContainer = document.getElementById('successImageContainer');
        if (successImage && this.config.successImageUrl) {
            successImage.src = this.config.successImageUrl;
            if (successImageContainer) successImageContainer.style.display = 'block';
        }

        // SMS disclaimer
        const smsDisclaimer = document.getElementById('smsDisclaimer');
        if (smsDisclaimer && this.config.smsDisclaimer) {
            smsDisclaimer.innerHTML = this.config.smsDisclaimer;
        }

        const smsPolicyLink = document.getElementById('smsPolicyLink');
        if (smsPolicyLink) smsPolicyLink.href = this.config.smsPolicyUrl;
    };

    /**
     * Utility Functions
     */
    DogRegistrationForm.prototype._getElement = function(id) {
        return document.getElementById(id);
    };

    DogRegistrationForm.prototype._getFieldValue = function(id) {
        const el = this._getElement(id);
        return el ? el.value.trim() : '';
    };

    DogRegistrationForm.prototype._showError = function(message, element = null) {
        if (element) element.classList.add('error');
        if (this.formMessage) {
            this.formMessage.textContent = message;
            this.formMessage.className = 'form-message error';
        }
        if (this.config.onError) {
            this.config.onError({ message, element });
        }
    };

    DogRegistrationForm.prototype._clearErrors = function() {
        document.querySelectorAll('.form-step input').forEach(input => {
            input.classList.remove('error');
        });
        if (this.formMessage) {
            this.formMessage.textContent = '';
            this.formMessage.className = 'form-message';
        }
    };

    DogRegistrationForm.prototype._resetSubmitButton = function(btn, originalText) {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    };

    DogRegistrationForm.prototype._showSuccessScreen = function() {
        if (this.contactForm) this.contactForm.style.display = 'none';
        if (this.progressTrack) this.progressTrack.style.display = 'none';
        if (this.successScreen) this.successScreen.style.display = 'flex';
    };

    /**
     * Step Navigation
     */
    DogRegistrationForm.prototype._showStep = function(step) {
        const validStep = Math.max(1, Math.min(parseInt(step) || 1, TOTAL_STEPS));
        
        document.querySelectorAll('.form-step').forEach(stepEl => {
            const stepNum = parseInt(stepEl.dataset.step);
            const isActive = stepNum === validStep;
            stepEl.classList.toggle('active', isActive);
            
            stepEl.querySelectorAll('input').forEach(input => {
                if (isActive && input.hasAttribute('data-originally-required')) {
                    input.required = true;
                } else if (!isActive && input.required) {
                    input.removeAttribute('required');
                }
            });
        });
        
        document.querySelectorAll('.milestone').forEach(milestone => {
            const milestoneStep = parseInt(milestone.dataset.step);
            milestone.classList.toggle('active', milestoneStep <= validStep);
        });
        
        const dogWalker = document.getElementById('dogWalker');
        if (dogWalker && this.progressTrack) {
            dogWalker.className = 'dog-walker step-' + validStep;
            this.progressTrack.className = 'progress-track step-' + validStep;
        }
        
        this.currentStep = validStep;

        if (this.config.onStepChange) {
            this.config.onStepChange(validStep);
        }
    };

    DogRegistrationForm.prototype._initializeFormFields = function() {
        document.querySelectorAll('.form-step input[required]').forEach(input => {
            input.setAttribute('data-originally-required', 'true');
        });
        this._showStep(1);
    };

    /**
     * Phone Number Formatting
     */
    DogRegistrationForm.prototype._formatPhoneNumber = function(value) {
        const phoneNumber = value.replace(/\D/g, '');
        const phoneNumberDigits = phoneNumber.slice(0, 10);
        
        if (phoneNumberDigits.length === 0) {
            return '';
        } else if (phoneNumberDigits.length <= 3) {
            return `(${phoneNumberDigits}`;
        } else if (phoneNumberDigits.length <= 6) {
            return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3)}`;
        } else {
            return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3, 6)}-${phoneNumberDigits.slice(6)}`;
        }
    };

    /**
     * Validation Functions
     */
    DogRegistrationForm.prototype._validatePhone = function(phone) {
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= MIN_PHONE_LENGTH;
    };

    DogRegistrationForm.prototype._validateEmail = function(email) {
        return EMAIL_REGEX.test(email);
    };

    DogRegistrationForm.prototype._collectFormData = function() {
        const notesEl = this._getElement('notes');
        
        return {
            phone: this._getFieldValue('phone'),
            firstName: this._getFieldValue('firstName'),
            lastName: this._getFieldValue('lastName'),
            email: this._getFieldValue('email'),
            dogName: this._getFieldValue('dogName'),
            breed: this._getFieldValue('breed'),
            notes: notesEl ? notesEl.value.trim() : '',
            smsOptIn: this._getElement('smsOptIn')?.checked || false
        };
    };

    DogRegistrationForm.prototype._validateFormData = function() {
        const errors = [];
        const phone = this._getFieldValue('phone');
        const firstName = this._getFieldValue('firstName');
        const lastName = this._getFieldValue('lastName');
        const email = this._getFieldValue('email');
        const dogName = this._getFieldValue('dogName');
        const breed = this._getFieldValue('breed');
        
        if (!phone) {
            errors.push({ field: 'phone', step: 1, message: 'Phone number is required' });
        } else if (!this._validatePhone(phone)) {
            errors.push({ field: 'phone', step: 1, message: 'Please enter a valid phone number' });
        }
        
        if (!firstName) errors.push({ field: 'firstName', step: 2, message: 'First name is required' });
        if (!lastName) errors.push({ field: 'lastName', step: 2, message: 'Last name is required' });
        
        if (!email) {
            errors.push({ field: 'email', step: 2, message: 'Email address is required' });
        } else if (!this._validateEmail(email)) {
            errors.push({ field: 'email', step: 2, message: 'Please enter a valid email address' });
        }
        
        if (!dogName) errors.push({ field: 'dogName', step: 3, message: 'Dog name is required' });
        if (!breed) errors.push({ field: 'breed', step: 3, message: 'Breed is required' });
        
        return errors;
    };

    /**
     * Tracking Functions (optional)
     */
    DogRegistrationForm.prototype._trackRegistrationStart = function() {
        if (!this.registrationStarted && this.config.enableTracking && typeof fbq !== 'undefined') {
            this.registrationStarted = true;
            this.formStartTime = Date.now();
            fbq('track', 'InitiateCheckout', {
                content_name: 'Dog Registration',
                content_category: 'Registration',
                ...this.config.trackingConfig
            });
        }
    };

    DogRegistrationForm.prototype._trackRegistrationComplete = function(formData) {
        if (!this.config.enableTracking || !formData) return;
        
        const now = Date.now();
        const totalTimeOnPage = window.TabTracking ? window.TabTracking.getTotalTimeOnPage() : 0;
        const timeInBackground = window.TabTracking ? window.TabTracking.getTimeInBackground() : 0;
        const timeSpent = this.formStartTime ? Math.round((now - this.formStartTime) / 1000) : 0;
        
        // Ensure fbq is available - wait for it to load if needed
        const self = this;
        function trackEvent() {
            if (typeof fbq === 'undefined') {
                // Wait a bit and try again if fbq isn't loaded yet
                setTimeout(trackEvent, 100);
                return;
            }
            
            const eventParams = {
                content_name: 'Dog Registration',
                content_category: 'Registration',
                value: DEFAULT_CONVERSION_VALUE,
                currency: 'USD',
                time_spent: timeSpent,
                total_time_on_page: Math.round(totalTimeOnPage / 1000),
                time_in_background: Math.round(timeInBackground / 1000),
                dog_name: formData.dogName || '',
                breed: formData.breed || '',
                ...self.config.trackingConfig
            };
            
            // Track both CompleteRegistration and Lead events for better coverage
            try {
                fbq('track', 'CompleteRegistration', eventParams);
                fbq('track', 'Lead', eventParams);
                console.log('Meta Pixel events tracked:', eventParams);
            } catch (error) {
                console.error('Error tracking Meta Pixel events:', error);
            }
        }
        
        // Start tracking
        trackEvent();
    };

    /**
     * Form Submission
     */
    DogRegistrationForm.prototype._submitForm = async function() {
        if (!this.contactForm) return;
        
        const submitBtn = this.contactForm.querySelector('.btn-submit');
        const originalBtnText = submitBtn?.textContent || 'Submit';
        
        this._clearErrors();
        
        if (!this._validateStep(this.currentStep)) {
            this._showError('Please complete the current step.');
            this._resetSubmitButton(submitBtn, originalBtnText);
            return;
        }
        
        const validationErrors = this._validateFormData();
        
        if (validationErrors.length > 0) {
            const firstError = validationErrors[0];
            this._showStep(firstError.step);
            
            validationErrors.forEach(err => {
                const errorField = this._getElement(err.field);
                if (errorField) errorField.classList.add('error');
            });
            
            this._showError(firstError.message);
            this._resetSubmitButton(submitBtn, originalBtnText);
            return;
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }
        
        try {
            const formData = this._collectFormData();
            
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this._trackRegistrationComplete(formData);
                // Small delay to ensure Meta Pixel event is sent before showing success screen
                setTimeout(() => {
                    this._showSuccessScreen();
                    
                    setTimeout(() => {
                        if (this.successScreen) {
                            this.successScreen.scrollIntoView({ 
                                behavior: 'instant', 
                                block: 'center' 
                            });
                        }
                    }, 0);
                }, 200);

                if (this.config.onSuccess) {
                    this.config.onSuccess(formData, data);
                }
            } else {
                this._showError(data.error || 'Something went wrong. Please try again.');
                this._resetSubmitButton(submitBtn, originalBtnText);
            }
        } catch (error) {
            this._showError('Network error. Please check your connection and try again.');
            this._resetSubmitButton(submitBtn, originalBtnText);
        }
    };

    /**
     * Step Validation
     */
    DogRegistrationForm.prototype._validateStep = function(step) {
        const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        if (!stepEl) return false;
        
        let isValid = true;
        const requiredInputs = stepEl.querySelectorAll('input[required]');
        
        requiredInputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (!input.checked) {
                    isValid = false;
                    input.classList.add('error');
                    const label = input.closest('.sms-checkbox-label');
                    if (label) label.classList.add('error');
                } else {
                    input.classList.remove('error');
                    const label = input.closest('.sms-checkbox-label');
                    if (label) label.classList.remove('error');
                }
                return;
            }
            
            if (input.type === 'file') {
                // File inputs are optional - skip validation
                return;
            }
            
            const value = input.value.trim();
            
            if (!value) {
                isValid = false;
                input.classList.add('error');
                if (input.id === 'breed') {
                    const breedSearch = this._getElement('breedSearch');
                    if (breedSearch) breedSearch.classList.add('error');
                }
            } else {
                input.classList.remove('error');
                if (input.id === 'breed') {
                    const breedSearch = this._getElement('breedSearch');
                    if (breedSearch) breedSearch.classList.remove('error');
                }
                
                if (step === 1 && input.id === 'phone' && !this._validatePhone(value)) {
                    isValid = false;
                    input.classList.add('error');
                } else if (step === 2 && input.id === 'email' && !this._validateEmail(value)) {
                    isValid = false;
                    input.classList.add('error');
                }
            }
        });
        
        return isValid;
    };

    /**
     * Breed Dropdown
     */
    DogRegistrationForm.prototype._initializeBreedDropdown = function() {
        const breedSearch = this._getElement('breedSearch');
        const breedHidden = this._getElement('breed');
        const breedDropdownList = this._getElement('breedDropdownList');
        
        if (!breedSearch || !breedHidden || !breedDropdownList) return;
        
        let isOpen = false;
        
        const filterBreeds = (searchTerm) => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return BREED_LIST;
            return BREED_LIST.filter(breed => breed.toLowerCase().includes(term));
        };
        
        const renderDropdown = (filteredBreeds) => {
            breedDropdownList.innerHTML = '';
            
            if (filteredBreeds.length === 0) {
                breedDropdownList.innerHTML = '<div class="breed-dropdown-item no-results">No breeds found</div>';
                return;
            }
            
            filteredBreeds.forEach(breed => {
                const item = document.createElement('div');
                item.className = 'breed-dropdown-item';
                item.textContent = breed;
                item.addEventListener('click', () => {
                    breedSearch.value = breed;
                    breedHidden.value = breed;
                    breedSearch.classList.remove('error');
                    closeDropdown();
                });
                breedDropdownList.appendChild(item);
            });
        };
        
        const openDropdown = () => {
            isOpen = true;
            breedDropdownList.style.display = 'block';
            const filtered = filterBreeds(breedSearch.value);
            renderDropdown(filtered);
        };
        
        const closeDropdown = () => {
            isOpen = false;
            breedDropdownList.style.display = 'none';
        };
        
        breedSearch.addEventListener('focus', openDropdown);
        breedSearch.addEventListener('input', (e) => {
            const filtered = filterBreeds(e.target.value);
            renderDropdown(filtered);
            if (!isOpen) openDropdown();
        });
        
        breedSearch.addEventListener('blur', () => {
            setTimeout(() => {
                closeDropdown();
                if (breedSearch.value && !BREED_LIST.includes(breedSearch.value)) {
                    breedSearch.value = '';
                    breedHidden.value = '';
                }
            }, 200);
        });
        
        breedSearch.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
                const items = breedDropdownList.querySelectorAll('.breed-dropdown-item:not(.no-results)');
                if (items.length === 0) return;
                
                if (e.key === 'Escape') {
                    closeDropdown();
                    breedSearch.blur();
                    return;
                }
                
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (items[0]) items[0].click();
                    return;
                }
                
                e.preventDefault();
                const currentIndex = Array.from(items).findIndex(item => item.classList.contains('highlighted'));
                let nextIndex = 0;
                
                if (e.key === 'ArrowDown') {
                    nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                } else if (e.key === 'ArrowUp') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                }
                
                items.forEach(item => item.classList.remove('highlighted'));
                items[nextIndex].classList.add('highlighted');
                items[nextIndex].scrollIntoView({ block: 'nearest' });
            }
        });
    };

    /**
     * Vaccination Cards
     */
    DogRegistrationForm.prototype._initializeVaccinationCards = function() {
        const vaccinationAccordion = document.querySelector('.vaccination-accordion');
        const vaccinationHeader = this._getElement('vaccinationAccordion');
        const vaccinationItems = document.querySelectorAll('.vaccination-item');
        
        if (vaccinationHeader && vaccinationAccordion) {
            vaccinationHeader.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                vaccinationAccordion.classList.toggle('active');
            });
            
            vaccinationItems.forEach(item => {
                const fileInput = item.querySelector('input[type="file"]');
                const fileNameSpan = item.querySelector('.vaccination-file-name');
                
                if (!fileInput) return;
                
                item.addEventListener('click', (e) => {
                    if (e.target.classList.contains('vaccination-file-name')) {
                        return;
                    }
                    fileInput.click();
                });
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        item.classList.add('has-file');
                        fileNameSpan.textContent = file.name;
                    } else {
                        item.classList.remove('has-file');
                        fileNameSpan.textContent = '';
                    }
                });
            });
        }
    };

    /**
     * Event Listeners
     */
    DogRegistrationForm.prototype._attachEventListeners = function() {
        // Next buttons
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this._trackRegistrationStart();
                if (this._validateStep(this.currentStep) && this.currentStep < TOTAL_STEPS) {
                    this.currentStep++;
                    this._showStep(this.currentStep);
                }
            });
        });
        
        // Back buttons
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.currentStep > 1) {
                    this.currentStep--;
                    this._showStep(this.currentStep);
                }
            });
        });
        
        // Form submit
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.currentStep === TOTAL_STEPS) {
                    this._submitForm();
                }
            });
        }
        
        // Phone number formatting
        const phoneInput = this._getElement('phone');
        if (phoneInput) {
            phoneInput.addEventListener('focus', () => {
                this._trackRegistrationStart();
            });
            
            phoneInput.addEventListener('input', (e) => {
                const cursorPosition = e.target.selectionStart;
                const oldValue = e.target.value;
                const formatted = this._formatPhoneNumber(e.target.value);
                
                e.target.value = formatted;
                
                const newCursorPosition = formatted.length - (oldValue.length - cursorPosition);
                e.target.setSelectionRange(newCursorPosition, newCursorPosition);
            });
            
            phoneInput.addEventListener('keydown', (e) => {
                if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true)) {
                    return;
                }
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
        }
    };

    /**
     * Scroll to form
     */
    DogRegistrationForm.prototype._scrollToForm = function() {
        const form = this._getElement('contactForm');
        if (form) {
            setTimeout(() => {
                form.scrollIntoView({ 
                    behavior: 'instant', 
                    block: 'center' 
                });
            }, 100);
        }
        
        if (document.readyState === 'complete') {
            setTimeout(() => {
                if (form) {
                    form.scrollIntoView({ 
                        behavior: 'instant', 
                        block: 'center' 
                    });
                }
            }, 100);
        }
    };

    // Export to global scope
    global.DogRegistrationForm = DogRegistrationForm;

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);

