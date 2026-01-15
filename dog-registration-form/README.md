# Dog Registration Form - Composable Component

A reusable, configurable multi-step dog registration form component that can be easily integrated into any project.

## Features

- ✅ Multi-step form with animated progress indicator
- ✅ Phone number auto-formatting
- ✅ Searchable breed dropdown with 200+ breeds
- ✅ File upload for vaccination records
- ✅ SMS opt-in with customizable disclaimer
- ✅ Success screen with customizable messaging
- ✅ Fully responsive design
- ✅ Configurable API endpoint
- ✅ Optional Facebook Pixel tracking
- ✅ Customizable text, images, and styling

## Files

- `form-template.html` - HTML structure for the form
- `dog-registration-form.js` - JavaScript module (configurable)
- `form-styles.css` - All CSS styles needed for the form
- `README.md` - This file

## Quick Start

### 1. Include the CSS

Add the CSS file to your HTML:

```html
<link rel="stylesheet" href="path/to/form-styles.css">
```

### 2. Include the HTML Template

Copy the contents of `form-template.html` into your page where you want the form to appear:

```html
<div class="register-content" id="dogRegistrationFormContainer">
    <!-- Paste form-template.html content here -->
</div>
```

### 3. Include the JavaScript

Add the JavaScript file before the closing `</body>` tag:

```html
<script src="path/to/dog-registration-form.js"></script>
```

### 4. Initialize the Form

Initialize the form with your configuration:

```html
<script>
    const form = new DogRegistrationForm({
        apiEndpoint: '/api/contact',
        dogIconUrl: '/path/to/dog-icon.png',
        successImageUrl: '/path/to/success-image.jpg',
        onSuccess: (formData, response) => {
            console.log('Form submitted successfully!', formData);
        },
        onError: (error) => {
            console.error('Form error:', error);
        }
    });
    form.init();
</script>
```

## Configuration Options

### Required Options

- `apiEndpoint` (string) - The API endpoint URL where form data will be submitted
  - Default: `'/api/contact'`

### Optional Options

#### Content Customization

- `formTitle` (string) - Title displayed at the top of the form
  - Default: `'Register Your Dog'`

- `dogIconUrl` (string) - URL to the dog icon image for the progress animation
  - Default: `''` (empty, no image shown)

- `successTitle` (string) - Title shown on success screen
  - Default: `'Thank You!'`

- `successMessage` (string) - Main success message
  - Default: `'Your registration has been submitted successfully.'`

- `successSubmessage` (string) - Secondary success message
  - Default: `'We'll be in touch with you soon.'`

- `successReturnUrl` (string) - URL for the "Return to Home" button
  - Default: `'/'`

- `successReturnText` (string) - Text for the return button
  - Default: `'Return to Home'`

- `successImageUrl` (string) - URL to image shown on success screen
  - Default: `''` (empty, image container hidden)

- `smsPolicyUrl` (string) - URL for SMS privacy policy link
  - Default: `'#'`

- `smsDisclaimer` (string) - Custom HTML for SMS disclaimer text
  - Default: `null` (uses default disclaimer)

#### Behavior Options

- `autoScroll` (boolean) - Automatically scroll to form on page load
  - Default: `true`

- `enableTracking` (boolean) - Enable Facebook Pixel tracking (requires fbq)
  - Default: `true`

- `trackingConfig` (object) - Additional tracking parameters
  - Default: `{}`

#### Callback Functions

- `onSuccess` (function) - Called when form is successfully submitted
  - Parameters: `(formData, response)`
  - Example: `onSuccess: (data, res) => { console.log('Success!', data); }`

- `onError` (function) - Called when form validation or submission fails
  - Parameters: `({ message, element })`
  - Example: `onError: (error) => { console.error('Error:', error.message); }`

- `onStepChange` (function) - Called when user navigates between steps
  - Parameters: `(stepNumber)`
  - Example: `onStepChange: (step) => { console.log('Now on step', step); }`

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dog Registration</title>
    <link rel="stylesheet" href="form-styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #F5F0E8;
        }
    </style>
</head>
<body>
    <!-- Form HTML from form-template.html -->
    <div class="register-content" id="dogRegistrationFormContainer">
        <!-- Paste form-template.html content here -->
    </div>

    <script src="dog-registration-form.js"></script>
    <script>
        const form = new DogRegistrationForm({
            apiEndpoint: '/api/register-dog',
            formTitle: 'Register Your Dog',
            dogIconUrl: '/assets/images/dog-walking.png',
            successImageUrl: '/assets/images/success.jpg',
            successTitle: 'Thank You!',
            successMessage: 'Your registration has been submitted successfully.',
            successSubmessage: 'We\'ll be in touch with you soon to discuss your dog\'s stay.',
            successReturnUrl: '/',
            successReturnText: 'Return to Home',
            smsPolicyUrl: 'https://example.com/privacy',
            autoScroll: true,
            enableTracking: true,
            onSuccess: (formData, response) => {
                console.log('Registration successful!', formData);
                // Optional: Redirect or show custom success message
            },
            onError: (error) => {
                console.error('Form error:', error.message);
                // Optional: Show custom error notification
            },
            onStepChange: (step) => {
                console.log('Current step:', step);
            }
        });
        form.init();
    </script>
</body>
</html>
```

## Form Data Structure

When submitted, the form sends the following data structure:

```json
{
    "phone": "(555) 123-4567",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "dogName": "Buddy",
    "breed": "Golden Retriever",
    "notes": "Loves to play fetch",
    "smsOptIn": true
}
```

Note: Vaccination file uploads are currently handled client-side but not included in the JSON payload. You may need to handle file uploads separately using FormData if needed.

## API Endpoint Requirements

Your API endpoint should:

1. Accept POST requests with `Content-Type: application/json`
2. Return JSON response with status code:
   - `200` or `201` for success
   - `400` or `422` for validation errors (include `error` field in response)
   - `500` for server errors

Example success response:
```json
{
    "success": true,
    "message": "Registration received"
}
```

Example error response:
```json
{
    "error": "Email address is already registered"
}
```

## Styling Customization

The form uses CSS variables for easy theming. You can override these in your stylesheet:

```css
:root {
    --primary-blue: #1E3A5F;
    --beige-bg: #F5F0E8;
    --beige-light: #E8E0D6;
    --white: #FFFFFF;
    --text-dark: #2C2C2C;
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills for fetch API if needed)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- None! The form is completely self-contained
- Optional: Facebook Pixel (`fbq`) for tracking
- Optional: Tab tracking utility (`window.TabTracking`) for time tracking

## Notes

- The form automatically formats phone numbers as `(XXX) XXX-XXXX`
- Breed search is case-insensitive and supports partial matching
- File uploads for vaccinations are optional
- SMS opt-in checkbox is required on step 1
- Form validation occurs on each step before proceeding
- All form fields are validated before final submission

## License

This form component is provided as-is for use in your projects.

## Support

For issues or questions, please refer to the main project repository.


