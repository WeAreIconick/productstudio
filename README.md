# Product Studio

A WordPress plugin that enables the Block Editor (Gutenberg) for WooCommerce products and provides a beautiful custom sidebar with collapsible panels for managing product data.

## Features

- Enables Gutenberg block editor for WooCommerce products
- Custom sidebar with collapsible panels:
  - **Pricing**: Regular price, sale price, tax status
  - **Inventory**: SKU, stock management, stock quantity, low stock threshold
  - **Shipping**: Weight, dimensions (length, width, height), shipping class
  - **Advanced**: Virtual product, downloadable, purchase note, menu order
- Beautiful, modern UI matching WordPress block editor design
- Responsive grid layout for dimensions
- Conditional field rendering (e.g., stock management fields)
- Translation-ready with i18n support

## Installation

1. Clone this repository to your WordPress plugins directory:
   ```bash
   cd wp-content/plugins
   git clone [repository-url] product-studio
   ```

2. Install dependencies:
   ```bash
   cd product-studio
   npm install
   ```

3. Build the plugin assets:
   ```bash
   npm run build
   ```

4. Activate the plugin in WordPress Admin:
   - Go to **Plugins**
   - Find **Product Studio**
   - Click **Activate**

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- WordPress 6.0+
- WooCommerce 7.0+

### Development Workflow

Start the development server with hot reload:
```bash
npm start
```

Build production assets:
```bash
npm run build
```

## Requirements

- WordPress 6.0 or higher
- WooCommerce 7.0 or higher
- PHP 7.4 or higher

## Usage

After activation, edit any WooCommerce product and you'll see:

1. The block editor enabled for the product description
2. A new "Product Studio" sidebar with collapsible panels for product data
3. All standard WooCommerce product fields accessible through the sidebar

## Customization

### Adding Custom Meta Fields

Register your custom meta fields in `product-studio.php`:

```php
register_post_meta('product', 'custom_field', [
    'type' => 'string',
    'single' => true,
    'show_in_rest' => true,
    'auth_callback' => function() {
        return current_user_can('edit_products');
    }
]);
```

Then add to the sidebar in `src/sidebar/index.js`:

```javascript
<TextControl
    label="Custom Field"
    value={meta.custom_field || ''}
    onChange={(value) => updateMeta('custom_field', value)}
/>
```

### Changing Panel Order

Modify the order of panels in `src/sidebar/index.js` by rearranging the `PluginDocumentSettingPanel` components.

### Collapsing Panels by Default

Set `initialOpen={false}` on any `PluginDocumentSettingPanel` component.

## License

GPL-2.0-or-later

## Credits

Built using WordPress Block Editor and WooCommerce.

