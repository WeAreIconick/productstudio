import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { PostTaxonomies } from '@wordpress/editor';
import { TextControl, SelectControl, ToggleControl, TextareaControl, Button } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import './style.scss';

const ProductDataSidebar = () => {
    // Get current post ID and meta
    const { postId, meta, postType } = useSelect((select) => ({
        postId: select('core/editor').getCurrentPostId(),
        meta: select('core/editor').getEditedPostAttribute('meta'),
        postType: select('core/editor').getCurrentPostType(),
    }));

    // Only show for products
    if (postType !== 'product') {
        return null;
    }
    
    // Close all panels on mount (optional - can remove if you want panels open)
    useEffect(() => {
        const closeAllPanels = () => {
            const panelNames = [
                'product-type',
                'product-pricing',
                'product-inventory',
                'product-shipping',
                'product-short-description',
                'product-reviews',
                'product-advanced'
            ];
            
            panelNames.forEach((name, index) => {
                setTimeout(() => {
                    const toggle = document.querySelector(`.components-panel__body-toggle[aria-controls*="${name}"]`);
                    if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
                        toggle.click();
                    }
                }, 100 * (index + 1));
            });
        };
        
        const timer = setTimeout(closeAllPanels, 300);
        return () => clearTimeout(timer);
    }, []);

    const { editPost } = useDispatch('core/editor');

    // Helper to update meta
    const updateMeta = (key, value) => {
        editPost({ meta: { [key]: value } });
    };
    
    // Get product type (simple, grouped, external, variable)
    const productType = meta._product_type || 'simple';
    
    // Helper to update product type
    const updateProductType = (newType) => {
        updateMeta('_product_type', newType);
    };

    return (
        <>
            <PluginDocumentSettingPanel
                name="product-type"
                title={__('Product Type', 'product-studio')}
                className="product-type-panel"
                initialOpen={false}
            >
                <SelectControl
                    label={__('Product Type', 'product-studio')}
                    value={productType}
                    options={[
                        { label: __('Simple Product', 'product-studio'), value: 'simple' },
                        { label: __('Grouped Product', 'product-studio'), value: 'grouped' },
                        { label: __('External/Affiliate Product', 'product-studio'), value: 'external' },
                        { label: __('Variable Product', 'product-studio'), value: 'variable' }
                    ]}
                    onChange={updateProductType}
                    help={__('Choose the product type', 'product-studio')}
                    __next40pxDefaultSize={true}
                    __nextHasNoMarginBottom={true}
                />
            </PluginDocumentSettingPanel>

            {productType === 'simple' && (
                <PluginDocumentSettingPanel
                    name="product-pricing"
                    title={__('Pricing', 'product-studio')}
                    className="product-pricing-panel"
                    initialOpen={false}
                >
                    <TextControl
                        label={__('Regular Price ($)', 'product-studio')}
                        value={meta._regular_price || ''}
                        onChange={(value) => updateMeta('_regular_price', value)}
                        type="number"
                        step="0.01"
                        min="0"
                        help={__('The standard price for this product', 'product-studio')}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                    
                    <TextControl
                        label={__('Sale Price ($)', 'product-studio')}
                        value={meta._sale_price || ''}
                        onChange={(value) => updateMeta('_sale_price', value)}
                        type="number"
                        step="0.01"
                        min="0"
                        help={__('Optional discounted price', 'product-studio')}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />

                    <SelectControl
                        label={__('Tax Status', 'product-studio')}
                        value={meta._tax_status || 'taxable'}
                        options={[
                            { label: __('Taxable', 'product-studio'), value: 'taxable' },
                            { label: __('Shipping Only', 'product-studio'), value: 'shipping' },
                            { label: __('None', 'product-studio'), value: 'none' }
                        ]}
                        onChange={(value) => updateMeta('_tax_status', value)}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                </PluginDocumentSettingPanel>
            )}
            
            {productType === 'external' && (
                <PluginDocumentSettingPanel
                    name="product-pricing"
                    title={__('External Product Settings', 'product-studio')}
                    className="product-pricing-panel"
                    initialOpen={false}
                >
                    <TextControl
                        label={__('Button Text', 'product-studio')}
                        value={meta._button_text || __('Buy product', 'product-studio')}
                        onChange={(value) => updateMeta('_button_text', value)}
                        help={__('Text for the external product button', 'product-studio')}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                    
                    <TextControl
                        label={__('Product URL', 'product-studio')}
                        value={meta._product_url || ''}
                        onChange={(value) => updateMeta('_product_url', value)}
                        type="url"
                        help={__('External URL for this product', 'product-studio')}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                    
                    <TextControl
                        label={__('Regular Price ($)', 'product-studio')}
                        value={meta._regular_price || ''}
                        onChange={(value) => updateMeta('_regular_price', value)}
                        type="number"
                        step="0.01"
                        min="0"
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                </PluginDocumentSettingPanel>
            )}

            {productType !== 'grouped' && productType !== 'external' && (
                <PluginDocumentSettingPanel
                    name="product-inventory"
                    title={__('Inventory', 'product-studio')}
                    className="product-inventory-panel"
                    initialOpen={false}
                >
                <TextControl
                    label={__('SKU', 'product-studio')}
                    value={meta._sku || ''}
                    onChange={(value) => updateMeta('_sku', value)}
                    help={__('Stock Keeping Unit - unique identifier', 'product-studio')}
                    __next40pxDefaultSize={true}
                    __nextHasNoMarginBottom={true}
                />

                <ToggleControl
                    label={__('Manage Stock', 'product-studio')}
                    checked={meta._manage_stock === 'yes'}
                    onChange={(checked) => updateMeta('_manage_stock', checked ? 'yes' : 'no')}
                    __nextHasNoMarginBottom={true}
                />

                {meta._manage_stock === 'yes' && (
                    <>
                        <TextControl
                            label={__('Stock Quantity', 'product-studio')}
                            value={meta._stock || ''}
                            onChange={(value) => updateMeta('_stock', value)}
                            type="number"
                            min="0"
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />

                        <TextControl
                            label={__('Low Stock Threshold', 'product-studio')}
                            value={meta._low_stock_amount || ''}
                            onChange={(value) => updateMeta('_low_stock_amount', value)}
                            type="number"
                            min="0"
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                    </>
                )}

                {meta._manage_stock !== 'yes' && (
                    <SelectControl
                        label={__('Stock Status', 'product-studio')}
                        value={meta._stock_status || 'instock'}
                        options={[
                            { label: __('In Stock', 'product-studio'), value: 'instock' },
                            { label: __('Out of Stock', 'product-studio'), value: 'outofstock' },
                            { label: __('On Backorder', 'product-studio'), value: 'onbackorder' }
                        ]}
                        onChange={(value) => updateMeta('_stock_status', value)}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                )}
            </PluginDocumentSettingPanel>
            )}

            {productType !== 'external' && (
                <PluginDocumentSettingPanel
                    name="product-shipping"
                    title={__('Shipping', 'product-studio')}
                    className="product-shipping-panel"
                    initialOpen={false}
                >
                <div className="dimensions-grid">
                    <TextControl
                        label={__('Weight (lbs)', 'product-studio')}
                        value={meta._weight || ''}
                        onChange={(value) => updateMeta('_weight', value)}
                        type="number"
                        step="0.01"
                        min="0"
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />

                    <TextControl
                        label={__('Length (in)', 'product-studio')}
                        value={meta._length || ''}
                        onChange={(value) => updateMeta('_length', value)}
                        type="number"
                        step="0.01"
                        min="0"
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />

                    <TextControl
                        label={__('Width (in)', 'product-studio')}
                        value={meta._width || ''}
                        onChange={(value) => updateMeta('_width', value)}
                        type="number"
                        step="0.01"
                        min="0"
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />

                    <TextControl
                        label={__('Height (in)', 'product-studio')}
                        value={meta._height || ''}
                        onChange={(value) => updateMeta('_height', value)}
                        type="number"
                        step="0.01"
                        min="0"
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                </div>

                <SelectControl
                    label={__('Shipping Class', 'product-studio')}
                    value={meta._shipping_class || ''}
                    options={[
                        { label: __('No Shipping Class', 'product-studio'), value: '' },
                        { label: __('Standard', 'product-studio'), value: 'standard' },
                        { label: __('Express', 'product-studio'), value: 'express' }
                    ]}
                    onChange={(value) => updateMeta('_shipping_class', value)}
                    __next40pxDefaultSize={true}
                    __nextHasNoMarginBottom={true}
                />
            </PluginDocumentSettingPanel>
            )}

            <PluginDocumentSettingPanel
                name="product-short-description"
                title={__('Short Description', 'product-studio')}
                className="product-short-description-panel"
                initialOpen={false}
            >
                <TextareaControl
                    label={__('Product Short Description', 'product-studio')}
                    value={meta._excerpt || ''}
                    onChange={(value) => updateMeta('_excerpt', value)}
                    help={__('This appears below the product name. Used in product listings and search results.', 'product-studio')}
                    rows={5}
                    __nextHasNoMarginBottom={true}
                />
            </PluginDocumentSettingPanel>

            <PluginDocumentSettingPanel
                name="product-reviews"
                title={__('Reviews', 'product-studio')}
                className="product-reviews-panel"
                initialOpen={false}
            >
                <ToggleControl
                    label={__('Enable Reviews', 'product-studio')}
                    checked={meta._enable_reviews === 'yes'}
                    onChange={(checked) => updateMeta('_enable_reviews', checked ? 'yes' : 'no')}
                    help={__('Allow customers to submit reviews', 'product-studio')}
                    __nextHasNoMarginBottom={true}
                />
            </PluginDocumentSettingPanel>

            <PluginDocumentSettingPanel
                name="product-advanced"
                title={__('Advanced', 'product-studio')}
                className="product-advanced-panel"
                initialOpen={false}
            >
                <ToggleControl
                    label={__('Virtual Product', 'product-studio')}
                    checked={meta._virtual === 'yes'}
                    onChange={(checked) => updateMeta('_virtual', checked ? 'yes' : 'no')}
                    help={__('No shipping needed', 'product-studio')}
                    __nextHasNoMarginBottom={true}
                />

                <ToggleControl
                    label={__('Downloadable', 'product-studio')}
                    checked={meta._downloadable === 'yes'}
                    onChange={(checked) => updateMeta('_downloadable', checked ? 'yes' : 'no')}
                    __nextHasNoMarginBottom={true}
                />

                <TextareaControl
                    label={__('Purchase Note', 'product-studio')}
                    value={meta._purchase_note || ''}
                    onChange={(value) => updateMeta('_purchase_note', value)}
                    help={__('Shown after purchase', 'product-studio')}
                    rows={3}
                    __nextHasNoMarginBottom={true}
                />

                <TextControl
                    label={__('Menu Order', 'product-studio')}
                    value={meta.menu_order || '0'}
                    onChange={(value) => updateMeta('menu_order', value)}
                    type="number"
                    help={__('Custom ordering position', 'product-studio')}
                    __next40pxDefaultSize={true}
                    __nextHasNoMarginBottom={true}
                />
            </PluginDocumentSettingPanel>

            {/* Use WordPress core PostTaxonomies component */}
            <PostTaxonomies />
        </>
    );
};

registerPlugin('product-studio-sidebar', {
    render: ProductDataSidebar,
    icon: 'products',
});
