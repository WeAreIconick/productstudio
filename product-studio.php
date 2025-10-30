<?php
/**
 * Plugin Name: Product Studio
 * Plugin URI: https://iconick.com/
 * Description: Enables block editor and adds custom sidebar for WooCommerce product data
 * Version: 1.0
 * Author: Iconick
 * Author URI: https://iconick.com/
 * License: GPL v2 or later
 * Text Domain: product-studio
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * WC requires at least: 7.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Check if WooCommerce is active - Warn but don't block
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p><strong>Product Studio:</strong> WooCommerce is required for this plugin to work properly.</p></div>';
    });
}

// Enable block editor for products - Force it!
add_filter('use_block_editor_for_post_type', function($use_block_editor, $post_type) {
    if ($post_type === 'product') {
        return true;
    }
    return $use_block_editor;
}, 999, 2); // High priority

// Disable classic editor
add_filter('classic_editor_enabled_editors_for_post_type', function($editors, $post_type) {
    if ($post_type === 'product') {
        return ['block'];
    }
    return $editors;
}, 999, 2); // High priority

// Force Gutenberg for products
add_filter('gutenberg_can_edit_post_type', function($can_edit, $post_type) {
    if ($post_type === 'product') {
        return true;
    }
    return $can_edit;
}, 999, 2);

// Disable classic editor completely for products
add_filter('use_block_editor_for_post', function($use_block_editor, $post) {
    if (!$post) return $use_block_editor;
    
    if (get_post_type($post) === 'product') {
        return true; // Always use block editor
    }
    
    return $use_block_editor;
}, 999, 2);

// Remove classic editor from allowed editors
add_filter('classic_editor_enabled_editors_for_post_type', function($editors, $post_type) {
    if ($post_type === 'product') {
        return ['block']; // Only block editor
    }
    return $editors;
}, 999, 2);

// Force disable classic editor plugin
add_filter('classic_editor_plugin_settings', function($settings) {
    $settings['allow-users'] = false;
    $settings['block-editor'] = true;
    return $settings;
}, 999);

// Remove ALL WooCommerce and WordPress meta boxes - High priority to run early
add_action('admin_init', function() {
    // Remove WooCommerce product data box
    remove_meta_box('woocommerce-product-data', 'product', 'normal');
    remove_meta_box('woocommerce-product-images', 'product', 'side');
    remove_meta_box('postimagediv', 'product', 'side');
    
    // Remove featured image and gallery boxes
    remove_meta_box('postimagediv', 'product', 'side');
    remove_meta_box('woocommerce-product-images', 'product', 'side');
    
    // Remove excerpt/short description
    remove_meta_box('postexcerpt', 'product', 'normal');
    
    // Remove tags
    remove_meta_box('tagsdiv-product_tag', 'product', 'side');
    remove_meta_box('product_tagdiv', 'product', 'side');
    
    // Remove taxonomy boxes
    remove_meta_box('tagsdiv-product_cat', 'product', 'side');
    remove_meta_box('product_catdiv', 'product', 'side');
    
    // Remove shipping/reviews
    remove_meta_box('product_shipping_meta', 'product', 'side');
    remove_meta_box('product_reviews_meta', 'product', 'normal');
    remove_meta_box('commentsdiv', 'product', 'normal');
    remove_meta_box('commentstatusdiv', 'product', 'normal');
    
    // Remove slug box
    remove_meta_box('slugdiv', 'product', 'normal');
    
    // Remove custom fields
    remove_meta_box('postcustom', 'product', 'normal');
    
    // Remove revisions
    remove_meta_box('revisionsdiv', 'product', 'normal');
    
    // Remove author
    remove_meta_box('authordiv', 'product', 'normal');
}, 1);

// Also use the standard action
add_action('add_meta_boxes', function() {
    remove_meta_box('woocommerce-product-data', 'product', 'normal');
    remove_meta_box('postexcerpt', 'product', 'normal');
    remove_meta_box('postimagediv', 'product', 'side');
    remove_meta_box('slugdiv', 'product', 'normal');
    remove_meta_box('postcustom', 'product', 'normal');
    remove_meta_box('commentsdiv', 'product', 'normal');
    remove_meta_box('commentstatusdiv', 'product', 'normal');
    remove_meta_box('woocommerce-product-images', 'product', 'side');
}, 999);

/**
 * Register meta fields so they're available in the REST API
 */
function product_studio_register_meta() {
    $meta_fields = [
        '_product_type' => 'string',
        '_product_image_gallery' => 'string',
        '_regular_price' => 'string',
        '_sale_price' => 'string',
        '_tax_status' => 'string',
        '_sku' => 'string',
        '_manage_stock' => 'string',
        '_stock' => 'string',
        '_stock_status' => 'string',
        '_low_stock_amount' => 'string',
        '_weight' => 'string',
        '_length' => 'string',
        '_width' => 'string',
        '_height' => 'string',
        '_shipping_class' => 'string',
        '_virtual' => 'string',
        '_downloadable' => 'string',
        '_purchase_note' => 'string',
        '_enable_reviews' => 'string',
        '_button_text' => 'string',
        '_product_url' => 'string',
        'menu_order' => 'integer',
    ];

    foreach ($meta_fields as $key => $type) {
        register_post_meta('product', $key, [
            'type' => $type,
            'single' => true,
            'show_in_rest' => true,
            'auth_callback' => function() {
                return current_user_can('edit_products');
            }
        ]);
    }
}
add_action('init', 'product_studio_register_meta');

/**
 * Enqueue sidebar assets
 */
function product_studio_enqueue_assets() {
    // Only load on product edit screen
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'product') {
        return;
    }

    $asset_file_path = plugin_dir_path(__FILE__) . 'build/sidebar.asset.php';
    if (!file_exists($asset_file_path)) {
        return;
    }

    $asset_file = include $asset_file_path;

    wp_enqueue_script(
        'product-studio-sidebar',
        plugins_url('build/sidebar.js', __FILE__),
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    wp_enqueue_style(
        'product-studio-sidebar',
        plugins_url('build/style-sidebar.css', __FILE__),
        ['wp-edit-post'],
        $asset_file['version']
    );

    wp_set_script_translations('product-studio-sidebar', 'product-studio');
}
add_action('enqueue_block_editor_assets', 'product_studio_enqueue_assets');


/**
 * Optimize taxonomy REST API queries - limit results and hide empty terms
 */
function product_studio_optimize_taxonomy_query($args, $request) {
    // Limit to 20 terms max for fast initial load
    $args['number'] = 20;
    // Hide empty terms to reduce payload
    $args['hide_empty'] = true;
    // Only return id and name fields if requested (reduces payload significantly)
    if (isset($request['_fields']) && $request['_fields'] === 'id,name') {
        $args['fields'] = 'id=>name';
    }
    return $args;
}
add_filter('rest_product_cat_query', 'product_studio_optimize_taxonomy_query', 10, 2);
add_filter('rest_product_tag_query', 'product_studio_optimize_taxonomy_query', 10, 2);

// Add brands taxonomy support if it exists
add_filter('rest_pa_brand_query', 'product_studio_optimize_taxonomy_query', 10, 2);

/**
 * Cache REST API taxonomy responses using transients for 1 hour
 */
function product_studio_cache_taxonomy_response($response, $handler, $request) {
    $route = $request->get_route();
    
    // Check if this is a taxonomy endpoint we want to cache
    $taxonomies_to_cache = ['product_cat', 'product_tag', 'pa_brand'];
    $should_cache = false;
    foreach ($taxonomies_to_cache as $taxonomy) {
        if (strpos($route, '/wp/v2/' . $taxonomy) === 0) {
            $should_cache = true;
            break;
        }
    }
    
    if (!$should_cache || is_wp_error($response)) {
        return $response;
    }
    
    // Build cache key from route and query params
    $cache_key = 'rest_tax_' . md5($route . serialize($request->get_query_params()));
    
    // Get cached data if available
    $cached = get_transient($cache_key);
    if ($cached !== false) {
        return new WP_REST_Response($cached, 200, array('X-Cache-Status' => 'HIT'));
    }
    
    // Cache the response for 1 hour
    if ($response->status === 200) {
        $data = $response->get_data();
        set_transient($cache_key, $data, HOUR_IN_SECONDS);
    }
    
    return $response;
}
add_filter('rest_post_dispatch', 'product_studio_cache_taxonomy_response', 10, 3);

/**
 * Clear taxonomy cache when terms are modified
 */
function product_studio_clear_taxonomy_cache($term_id, $taxonomy) {
    $taxonomies_to_clear = ['product_cat', 'product_tag', 'pa_brand'];
    if (in_array($taxonomy, $taxonomies_to_clear)) {
        // Clear all taxonomy caches for this taxonomy by deleting all transient keys with our prefix
        global $wpdb;
        // WordPress stores transients with timeout suffix, so we need to match both transient and transient_timeout
        $pattern = $wpdb->esc_like('_transient_rest_tax_') . '%';
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
            $pattern,
            str_replace('_transient_', '_transient_timeout_', $pattern)
        ));
    }
}
add_action('created_term', 'product_studio_clear_taxonomy_cache', 10, 2);
add_action('edited_term', 'product_studio_clear_taxonomy_cache', 10, 2);
add_action('delete_term', 'product_studio_clear_taxonomy_cache', 10, 2);


