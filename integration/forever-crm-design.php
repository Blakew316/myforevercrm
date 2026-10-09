<?php
/**
 * Plugin Name: My Forever CRM — Design 4.0
 * Description: Apple-style interface and navigation layer for the Forever Agency CRM screens. Adds one stylesheet and one script to CRM pages; changes no data, forms or permissions.
 * Version:     4.0.0
 *
 * Install: copy this file and the forever-crm-design/ folder into wp-content/mu-plugins/.
 * Remove:  delete both. Nothing is stored in the database.
 *
 * The CRM prints its own <head>, so the files are added by filtering the
 * finished page: only responses that contain the CRM app shell
 * (data-sidebar-app) are touched, everything else passes through unchanged.
 * Because it lives outside the plugin folder, CRM plugin updates keep it.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'plugins_loaded', 'fagcrm_design400_start', 1 );

function fagcrm_design400_start() {
	if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return;
	}
	if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'GET' !== $_SERVER['REQUEST_METHOD'] ) {
		return;
	}
	ob_start( 'fagcrm_design400_inject' );
}

function fagcrm_design400_inject( $html ) {
	if ( ! is_string( $html ) || false === strpos( $html, 'data-sidebar-app' ) || false === stripos( $html, '</head>' ) ) {
		return $html;
	}
	if ( false !== strpos( $html, 'design-400.css' ) ) {
		return $html; // already present (e.g. drop-in files in use)
	}
	$dir  = WPMU_PLUGIN_DIR . '/forever-crm-design/';
	$url  = WPMU_PLUGIN_URL . '/forever-crm-design/';
	$css  = $url . 'design-400.css?ver=' . rawurlencode( (string) @filemtime( $dir . 'design-400.css' ) );
	$js   = $url . 'design-400.js?ver=' . rawurlencode( (string) @filemtime( $dir . 'design-400.js' ) );
	$tags = '<link rel="stylesheet" href="' . esc_url( $css ) . '">'
		. '<script src="' . esc_url( $js ) . '" defer></script>';
	$pos  = strripos( $html, '</head>' );
	return substr( $html, 0, $pos ) . $tags . substr( $html, $pos );
}
