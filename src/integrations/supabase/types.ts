export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      auto_campaign_rules: {
        Row: {
          allow_crm_task: boolean | null
          allow_direct_mail_export: boolean | null
          allow_door_knock_route: boolean | null
          allow_email: boolean | null
          allow_rep_push_notification: boolean | null
          allow_sms: boolean | null
          created_at: string
          hail_threshold: number | null
          id: string
          is_active: boolean | null
          market_id: string | null
          market_scope_type: string | null
          market_scope_value: string | null
          message_template: string | null
          owner_id: string | null
          rain_threshold: number | null
          require_manual_approval: boolean | null
          rule_name: string
          send_timing: string | null
          severe_alert_type: string | null
          sustained_wind_threshold: number | null
          tornado_alert_type: string | null
          trigger_hail: boolean | null
          trigger_heavy_rain: boolean | null
          trigger_lightning: boolean | null
          trigger_severe_weather: boolean | null
          trigger_sustained_wind: boolean | null
          trigger_tornado: boolean | null
          trigger_wind_gust: boolean | null
          updated_at: string
          wind_gust_threshold: number | null
        }
        Insert: {
          allow_crm_task?: boolean | null
          allow_direct_mail_export?: boolean | null
          allow_door_knock_route?: boolean | null
          allow_email?: boolean | null
          allow_rep_push_notification?: boolean | null
          allow_sms?: boolean | null
          created_at?: string
          hail_threshold?: number | null
          id?: string
          is_active?: boolean | null
          market_id?: string | null
          market_scope_type?: string | null
          market_scope_value?: string | null
          message_template?: string | null
          owner_id?: string | null
          rain_threshold?: number | null
          require_manual_approval?: boolean | null
          rule_name: string
          send_timing?: string | null
          severe_alert_type?: string | null
          sustained_wind_threshold?: number | null
          tornado_alert_type?: string | null
          trigger_hail?: boolean | null
          trigger_heavy_rain?: boolean | null
          trigger_lightning?: boolean | null
          trigger_severe_weather?: boolean | null
          trigger_sustained_wind?: boolean | null
          trigger_tornado?: boolean | null
          trigger_wind_gust?: boolean | null
          updated_at?: string
          wind_gust_threshold?: number | null
        }
        Update: {
          allow_crm_task?: boolean | null
          allow_direct_mail_export?: boolean | null
          allow_door_knock_route?: boolean | null
          allow_email?: boolean | null
          allow_rep_push_notification?: boolean | null
          allow_sms?: boolean | null
          created_at?: string
          hail_threshold?: number | null
          id?: string
          is_active?: boolean | null
          market_id?: string | null
          market_scope_type?: string | null
          market_scope_value?: string | null
          message_template?: string | null
          owner_id?: string | null
          rain_threshold?: number | null
          require_manual_approval?: boolean | null
          rule_name?: string
          send_timing?: string | null
          severe_alert_type?: string | null
          sustained_wind_threshold?: number | null
          tornado_alert_type?: string | null
          trigger_hail?: boolean | null
          trigger_heavy_rain?: boolean | null
          trigger_lightning?: boolean | null
          trigger_severe_weather?: boolean | null
          trigger_sustained_wind?: boolean | null
          trigger_tornado?: boolean | null
          trigger_wind_gust?: boolean | null
          updated_at?: string
          wind_gust_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_campaign_rules_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_compliance_logs: {
        Row: {
          blocked_reason: string | null
          channel: string | null
          consent_status: boolean | null
          created_at: string
          dnc_status: boolean | null
          eligible: boolean | null
          id: string
          lead_id: string | null
          message_sent: boolean | null
          opt_out_status: boolean | null
          sent_at: string | null
          triggered_campaign_id: string | null
        }
        Insert: {
          blocked_reason?: string | null
          channel?: string | null
          consent_status?: boolean | null
          created_at?: string
          dnc_status?: boolean | null
          eligible?: boolean | null
          id?: string
          lead_id?: string | null
          message_sent?: boolean | null
          opt_out_status?: boolean | null
          sent_at?: string | null
          triggered_campaign_id?: string | null
        }
        Update: {
          blocked_reason?: string | null
          channel?: string | null
          consent_status?: boolean | null
          created_at?: string
          dnc_status?: boolean | null
          eligible?: boolean | null
          id?: string
          lead_id?: string | null
          message_sent?: boolean | null
          opt_out_status?: boolean | null
          sent_at?: string | null
          triggered_campaign_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_compliance_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_compliance_logs_triggered_campaign_id_fkey"
            columns: ["triggered_campaign_id"]
            isOneToOne: false
            referencedRelation: "triggered_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_targets: {
        Row: {
          campaign_id: string | null
          city: string | null
          county: string | null
          created_at: string
          geofence_geojson: Json | null
          id: string
          market_id: string | null
          region: string | null
          state: string | null
          target_type: string | null
          zip_code: string | null
        }
        Insert: {
          campaign_id?: string | null
          city?: string | null
          county?: string | null
          created_at?: string
          geofence_geojson?: Json | null
          id?: string
          market_id?: string | null
          region?: string | null
          state?: string | null
          target_type?: string | null
          zip_code?: string | null
        }
        Update: {
          campaign_id?: string | null
          city?: string | null
          county?: string | null
          created_at?: string
          geofence_geojson?: Json | null
          id?: string
          market_id?: string | null
          region?: string | null
          state?: string | null
          target_type?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_targets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_targets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          channel: string | null
          created_at: string
          id: string
          message: string | null
          name: string | null
          opt_out_count: number
          owner_id: string | null
          sent_count: number
        }
        Insert: {
          channel?: string | null
          created_at?: string
          id?: string
          message?: string | null
          name?: string | null
          opt_out_count?: number
          owner_id?: string | null
          sent_count?: number
        }
        Update: {
          channel?: string | null
          created_at?: string
          id?: string
          message?: string | null
          name?: string | null
          opt_out_count?: number
          owner_id?: string | null
          sent_count?: number
        }
        Relationships: []
      }
      contact_methods: {
        Row: {
          consent_source: string | null
          created_at: string
          dnc_status: boolean
          email: string | null
          email_consent: boolean
          email_unsubscribed: boolean
          id: string
          lead_id: string | null
          opt_in_date: string | null
          opt_out_date: string | null
          phone: string | null
          sms_consent: boolean
        }
        Insert: {
          consent_source?: string | null
          created_at?: string
          dnc_status?: boolean
          email?: string | null
          email_consent?: boolean
          email_unsubscribed?: boolean
          id?: string
          lead_id?: string | null
          opt_in_date?: string | null
          opt_out_date?: string | null
          phone?: string | null
          sms_consent?: boolean
        }
        Update: {
          consent_source?: string | null
          created_at?: string
          dnc_status?: boolean
          email?: string | null
          email_consent?: boolean
          email_unsubscribed?: boolean
          id?: string
          lead_id?: string | null
          opt_in_date?: string | null
          opt_out_date?: string | null
          phone?: string | null
          sms_consent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "contact_methods_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_leads: {
        Row: {
          company: string
          consent: boolean
          created_at: string
          email: string
          id: string
          name: string
          notified: boolean
          phone: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          company: string
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          notified?: boolean
          phone: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          company?: string
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          notified?: boolean
          phone?: string
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      job_zones: {
        Row: {
          active_status: boolean
          created_at: string
          id: string
          job_address: string | null
          polygon_geojson: Json | null
          radius_miles: number | null
        }
        Insert: {
          active_status?: boolean
          created_at?: string
          id?: string
          job_address?: string | null
          polygon_geojson?: Json | null
          radius_miles?: number | null
        }
        Update: {
          active_status?: boolean
          created_at?: string
          id?: string
          job_address?: string | null
          polygon_geojson?: Json | null
          radius_miles?: number | null
        }
        Relationships: []
      }
      lead_imports: {
        Row: {
          created_at: string
          duplicate_count: number
          field_mapping: Json | null
          file_name: string
          id: string
          imported_count: number
          invalid_count: number
          notes: string | null
          owner_id: string
          source_tag: string | null
          status: string
          total_rows: number
        }
        Insert: {
          created_at?: string
          duplicate_count?: number
          field_mapping?: Json | null
          file_name: string
          id?: string
          imported_count?: number
          invalid_count?: number
          notes?: string | null
          owner_id: string
          source_tag?: string | null
          status?: string
          total_rows?: number
        }
        Update: {
          created_at?: string
          duplicate_count?: number
          field_mapping?: Json | null
          file_name?: string
          id?: string
          imported_count?: number
          invalid_count?: number
          notes?: string | null
          owner_id?: string
          source_tag?: string | null
          status?: string
          total_rows?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_rep: string | null
          created_at: string
          id: string
          import_id: string | null
          lead_status: string
          notes: string | null
          owner_id: string | null
          property_id: string | null
          source: string | null
          storm_event_id: string | null
          storm_score: number | null
        }
        Insert: {
          assigned_rep?: string | null
          created_at?: string
          id?: string
          import_id?: string | null
          lead_status?: string
          notes?: string | null
          owner_id?: string | null
          property_id?: string | null
          source?: string | null
          storm_event_id?: string | null
          storm_score?: number | null
        }
        Update: {
          assigned_rep?: string | null
          created_at?: string
          id?: string
          import_id?: string | null
          lead_status?: string
          notes?: string | null
          owner_id?: string | null
          property_id?: string | null
          source?: string | null
          storm_event_id?: string | null
          storm_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_storm_event_id_fkey"
            columns: ["storm_event_id"]
            isOneToOne: false
            referencedRelation: "storm_events"
            referencedColumns: ["id"]
          },
        ]
      }
      live_weather_events: {
        Row: {
          created_at: string
          current_temperature: number | null
          dew_point: number | null
          event_type: string | null
          feels_like: number | null
          hail_risk: number | null
          humidity: number | null
          id: string
          lightning_active: boolean | null
          market_id: string | null
          pressure: number | null
          rain_chance: number | null
          recommended_action: string | null
          severe_alert_type: string | null
          storm_arrival_time: string | null
          weather_geojson: Json | null
          wind_direction: string | null
          wind_gust: number | null
          wind_speed: number | null
        }
        Insert: {
          created_at?: string
          current_temperature?: number | null
          dew_point?: number | null
          event_type?: string | null
          feels_like?: number | null
          hail_risk?: number | null
          humidity?: number | null
          id?: string
          lightning_active?: boolean | null
          market_id?: string | null
          pressure?: number | null
          rain_chance?: number | null
          recommended_action?: string | null
          severe_alert_type?: string | null
          storm_arrival_time?: string | null
          weather_geojson?: Json | null
          wind_direction?: string | null
          wind_gust?: number | null
          wind_speed?: number | null
        }
        Update: {
          created_at?: string
          current_temperature?: number | null
          dew_point?: number | null
          event_type?: string | null
          feels_like?: number | null
          hail_risk?: number | null
          humidity?: number | null
          id?: string
          lightning_active?: boolean | null
          market_id?: string | null
          pressure?: number | null
          rain_chance?: number | null
          recommended_action?: string | null
          severe_alert_type?: string | null
          storm_arrival_time?: string | null
          weather_geojson?: Json | null
          wind_direction?: string | null
          wind_gust?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_weather_events_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_storm_scores: {
        Row: {
          affected_home_count: number | null
          average_home_value: number | null
          average_roof_age: number | null
          claim_likelihood_score: number | null
          competition_score: number | null
          created_at: string
          distance_from_office: number | null
          hail_size: number | null
          id: string
          market_id: string | null
          owner_id: string | null
          storm_event_id: string | null
          total_opportunity_score: number | null
          wind_speed: number | null
        }
        Insert: {
          affected_home_count?: number | null
          average_home_value?: number | null
          average_roof_age?: number | null
          claim_likelihood_score?: number | null
          competition_score?: number | null
          created_at?: string
          distance_from_office?: number | null
          hail_size?: number | null
          id?: string
          market_id?: string | null
          owner_id?: string | null
          storm_event_id?: string | null
          total_opportunity_score?: number | null
          wind_speed?: number | null
        }
        Update: {
          affected_home_count?: number | null
          average_home_value?: number | null
          average_roof_age?: number | null
          claim_likelihood_score?: number | null
          competition_score?: number | null
          created_at?: string
          distance_from_office?: number | null
          hail_size?: number | null
          id?: string
          market_id?: string | null
          owner_id?: string | null
          storm_event_id?: string | null
          total_opportunity_score?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_storm_scores_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_storm_scores_storm_event_id_fkey"
            columns: ["storm_event_id"]
            isOneToOne: false
            referencedRelation: "storm_events"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          cities: string[] | null
          counties: string[] | null
          created_at: string
          filters: Json
          id: string
          market_name: string
          market_type: string | null
          notes: string | null
          opportunity_score: number | null
          owner_id: string | null
          region: string | null
          regions: string[]
          state: string | null
          states: string[]
          updated_at: string
          zip_codes: string[] | null
        }
        Insert: {
          cities?: string[] | null
          counties?: string[] | null
          created_at?: string
          filters?: Json
          id?: string
          market_name: string
          market_type?: string | null
          notes?: string | null
          opportunity_score?: number | null
          owner_id?: string | null
          region?: string | null
          regions?: string[]
          state?: string | null
          states?: string[]
          updated_at?: string
          zip_codes?: string[] | null
        }
        Update: {
          cities?: string[] | null
          counties?: string[] | null
          created_at?: string
          filters?: Json
          id?: string
          market_name?: string
          market_type?: string | null
          notes?: string | null
          opportunity_score?: number | null
          owner_id?: string | null
          region?: string | null
          regions?: string[]
          state?: string | null
          states?: string[]
          updated_at?: string
          zip_codes?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          google_review_url: string | null
          id: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          google_review_url?: string | null
          id?: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          google_review_url?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          created_at: string
          data_source: string | null
          estimated_roof_age: number | null
          home_value: number | null
          id: string
          latitude: number | null
          longitude: number | null
          mailing_address: string | null
          owner_id: string | null
          owner_name: string | null
          parcel_id: string | null
          property_address: string | null
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          estimated_roof_age?: number | null
          home_value?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          mailing_address?: string | null
          owner_id?: string | null
          owner_name?: string | null
          parcel_id?: string | null
          property_address?: string | null
        }
        Update: {
          created_at?: string
          data_source?: string | null
          estimated_roof_age?: number | null
          home_value?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          mailing_address?: string | null
          owner_id?: string | null
          owner_name?: string | null
          parcel_id?: string | null
          property_address?: string | null
        }
        Relationships: []
      }
      storm_events: {
        Row: {
          area_name: string | null
          confidence_score: number | null
          created_at: string
          data_provider: string | null
          event_date: string | null
          hail_size: number | null
          id: string
          overlay_color: string | null
          overlay_opacity: number | null
          storm_intensity: number | null
          storm_path_geojson: Json | null
          storm_polygon: Json | null
          storm_type: string | null
          wind_speed: number | null
        }
        Insert: {
          area_name?: string | null
          confidence_score?: number | null
          created_at?: string
          data_provider?: string | null
          event_date?: string | null
          hail_size?: number | null
          id?: string
          overlay_color?: string | null
          overlay_opacity?: number | null
          storm_intensity?: number | null
          storm_path_geojson?: Json | null
          storm_polygon?: Json | null
          storm_type?: string | null
          wind_speed?: number | null
        }
        Update: {
          area_name?: string | null
          confidence_score?: number | null
          created_at?: string
          data_provider?: string | null
          event_date?: string | null
          hail_size?: number | null
          id?: string
          overlay_color?: string | null
          overlay_opacity?: number | null
          storm_intensity?: number | null
          storm_path_geojson?: Json | null
          storm_polygon?: Json | null
          storm_type?: string | null
          wind_speed?: number | null
        }
        Relationships: []
      }
      storm_overlay_layers: {
        Row: {
          color: string | null
          created_at: string
          geojson: Json | null
          id: string
          layer_name: string | null
          layer_type: string | null
          max_intensity: number | null
          min_intensity: number | null
          opacity: number | null
          storm_event_id: string | null
          visible_default: boolean | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          geojson?: Json | null
          id?: string
          layer_name?: string | null
          layer_type?: string | null
          max_intensity?: number | null
          min_intensity?: number | null
          opacity?: number | null
          storm_event_id?: string | null
          visible_default?: boolean | null
        }
        Update: {
          color?: string | null
          created_at?: string
          geojson?: Json | null
          id?: string
          layer_name?: string | null
          layer_type?: string | null
          max_intensity?: number | null
          min_intensity?: number | null
          opacity?: number | null
          storm_event_id?: string | null
          visible_default?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "storm_overlay_layers_storm_event_id_fkey"
            columns: ["storm_event_id"]
            isOneToOne: false
            referencedRelation: "storm_events"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          advanced_weather_enabled: boolean | null
          ai_scoring_enabled: boolean | null
          api_access_enabled: boolean | null
          automation_enabled: boolean | null
          created_at: string
          crm_integrations_enabled: boolean | null
          id: string
          max_emails_per_month: number | null
          max_leads_per_month: number | null
          max_markets: number | null
          max_sms_per_month: number | null
          monthly_price: number | null
          plan_name: string | null
          sms_enabled: boolean | null
          team_accounts_enabled: boolean | null
          white_label_enabled: boolean | null
          yearly_price: number | null
        }
        Insert: {
          advanced_weather_enabled?: boolean | null
          ai_scoring_enabled?: boolean | null
          api_access_enabled?: boolean | null
          automation_enabled?: boolean | null
          created_at?: string
          crm_integrations_enabled?: boolean | null
          id?: string
          max_emails_per_month?: number | null
          max_leads_per_month?: number | null
          max_markets?: number | null
          max_sms_per_month?: number | null
          monthly_price?: number | null
          plan_name?: string | null
          sms_enabled?: boolean | null
          team_accounts_enabled?: boolean | null
          white_label_enabled?: boolean | null
          yearly_price?: number | null
        }
        Update: {
          advanced_weather_enabled?: boolean | null
          ai_scoring_enabled?: boolean | null
          api_access_enabled?: boolean | null
          automation_enabled?: boolean | null
          created_at?: string
          crm_integrations_enabled?: boolean | null
          id?: string
          max_emails_per_month?: number | null
          max_leads_per_month?: number | null
          max_markets?: number | null
          max_sms_per_month?: number | null
          monthly_price?: number | null
          plan_name?: string | null
          sms_enabled?: boolean | null
          team_accounts_enabled?: boolean | null
          white_label_enabled?: boolean | null
          yearly_price?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_accounts: {
        Row: {
          created_at: string
          id: string
          owner_user_id: string
          permissions: Json | null
          role: string | null
          team_user_id: string
          territory: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          owner_user_id: string
          permissions?: Json | null
          role?: string | null
          team_user_id: string
          territory?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          owner_user_id?: string
          permissions?: Json | null
          role?: string | null
          team_user_id?: string
          territory?: string | null
        }
        Relationships: []
      }
      triggered_campaigns: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          blocked_contact_count: number | null
          campaign_id: string | null
          campaign_status: string | null
          channel: string | null
          channels: string[] | null
          compliance_notes: string | null
          created_at: string
          eligible_contact_count: number | null
          id: string
          is_demo: boolean | null
          market_id: string | null
          market_name: string | null
          message_body: string | null
          owner_id: string | null
          rejected_at: string | null
          requires_approval: boolean | null
          rerouted_to_door_knock: number | null
          rerouted_to_mail: number | null
          rule_id: string | null
          rule_name: string | null
          sent_at: string | null
          sms_blocked_dnc: number | null
          sms_blocked_no_consent: number | null
          sms_eligible: number | null
          trigger_reading: string | null
          trigger_type: string | null
          weather_trigger_event_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          blocked_contact_count?: number | null
          campaign_id?: string | null
          campaign_status?: string | null
          channel?: string | null
          channels?: string[] | null
          compliance_notes?: string | null
          created_at?: string
          eligible_contact_count?: number | null
          id?: string
          is_demo?: boolean | null
          market_id?: string | null
          market_name?: string | null
          message_body?: string | null
          owner_id?: string | null
          rejected_at?: string | null
          requires_approval?: boolean | null
          rerouted_to_door_knock?: number | null
          rerouted_to_mail?: number | null
          rule_id?: string | null
          rule_name?: string | null
          sent_at?: string | null
          sms_blocked_dnc?: number | null
          sms_blocked_no_consent?: number | null
          sms_eligible?: number | null
          trigger_reading?: string | null
          trigger_type?: string | null
          weather_trigger_event_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          blocked_contact_count?: number | null
          campaign_id?: string | null
          campaign_status?: string | null
          channel?: string | null
          channels?: string[] | null
          compliance_notes?: string | null
          created_at?: string
          eligible_contact_count?: number | null
          id?: string
          is_demo?: boolean | null
          market_id?: string | null
          market_name?: string | null
          message_body?: string | null
          owner_id?: string | null
          rejected_at?: string | null
          requires_approval?: boolean | null
          rerouted_to_door_knock?: number | null
          rerouted_to_mail?: number | null
          rule_id?: string | null
          rule_name?: string | null
          sent_at?: string | null
          sms_blocked_dnc?: number | null
          sms_blocked_no_consent?: number | null
          sms_eligible?: number | null
          trigger_reading?: string | null
          trigger_type?: string | null
          weather_trigger_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "triggered_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triggered_campaigns_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triggered_campaigns_weather_trigger_event_id_fkey"
            columns: ["weather_trigger_event_id"]
            isOneToOne: false
            referencedRelation: "weather_trigger_events"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          api_calls: number | null
          campaigns_triggered: number | null
          created_at: string
          emails_sent: number | null
          id: string
          leads_generated: number | null
          markets_saved: number | null
          sms_sent: number | null
          tracking_month: string | null
          user_id: string
        }
        Insert: {
          api_calls?: number | null
          campaigns_triggered?: number | null
          created_at?: string
          emails_sent?: number | null
          id?: string
          leads_generated?: number | null
          markets_saved?: number | null
          sms_sent?: number | null
          tracking_month?: string | null
          user_id: string
        }
        Update: {
          api_calls?: number | null
          campaigns_triggered?: number | null
          created_at?: string
          emails_sent?: number | null
          id?: string
          leads_generated?: number | null
          markets_saved?: number | null
          sms_sent?: number | null
          tracking_month?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_map_preferences: {
        Row: {
          claim_opportunity_enabled: boolean | null
          created_at: string
          default_map_type: string | null
          hail_layer_enabled: boolean | null
          hybrid_enabled: boolean | null
          id: string
          job_zone_enabled: boolean | null
          lead_heatmap_enabled: boolean | null
          lightning_layer_enabled: boolean | null
          measurement_tools_enabled: boolean | null
          parcel_layer_enabled: boolean | null
          rain_layer_enabled: boolean | null
          roof_age_heatmap_enabled: boolean | null
          route_layer_enabled: boolean | null
          satellite_enabled: boolean | null
          saved_market_boundaries_enabled: boolean | null
          street_view_enabled: boolean | null
          terrain_enabled: boolean | null
          three_d_enabled: boolean | null
          tornado_layer_enabled: boolean | null
          updated_at: string
          user_id: string
          wind_layer_enabled: boolean | null
        }
        Insert: {
          claim_opportunity_enabled?: boolean | null
          created_at?: string
          default_map_type?: string | null
          hail_layer_enabled?: boolean | null
          hybrid_enabled?: boolean | null
          id?: string
          job_zone_enabled?: boolean | null
          lead_heatmap_enabled?: boolean | null
          lightning_layer_enabled?: boolean | null
          measurement_tools_enabled?: boolean | null
          parcel_layer_enabled?: boolean | null
          rain_layer_enabled?: boolean | null
          roof_age_heatmap_enabled?: boolean | null
          route_layer_enabled?: boolean | null
          satellite_enabled?: boolean | null
          saved_market_boundaries_enabled?: boolean | null
          street_view_enabled?: boolean | null
          terrain_enabled?: boolean | null
          three_d_enabled?: boolean | null
          tornado_layer_enabled?: boolean | null
          updated_at?: string
          user_id: string
          wind_layer_enabled?: boolean | null
        }
        Update: {
          claim_opportunity_enabled?: boolean | null
          created_at?: string
          default_map_type?: string | null
          hail_layer_enabled?: boolean | null
          hybrid_enabled?: boolean | null
          id?: string
          job_zone_enabled?: boolean | null
          lead_heatmap_enabled?: boolean | null
          lightning_layer_enabled?: boolean | null
          measurement_tools_enabled?: boolean | null
          parcel_layer_enabled?: boolean | null
          rain_layer_enabled?: boolean | null
          roof_age_heatmap_enabled?: boolean | null
          route_layer_enabled?: boolean | null
          satellite_enabled?: boolean | null
          saved_market_boundaries_enabled?: boolean | null
          street_view_enabled?: boolean | null
          terrain_enabled?: boolean | null
          three_d_enabled?: boolean | null
          tornado_layer_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          wind_layer_enabled?: boolean | null
        }
        Relationships: []
      }
      user_market_automation_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          market_id: string | null
          market_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          market_id?: string | null
          market_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          market_id?: string | null
          market_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          billing_cycle: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_trigger_events: {
        Row: {
          affected_property_count: number | null
          alert_description: string | null
          alert_title: string | null
          blocked_sms_count: number | null
          created_at: string
          direct_mail_count: number | null
          eligible_email_count: number | null
          eligible_sms_count: number | null
          id: string
          market_id: string | null
          recommended_action: string | null
          rule_id: string | null
          storm_event_id: string | null
          storm_path_geojson: Json | null
          trigger_status: string | null
          trigger_threshold: number | null
          trigger_type: string | null
          trigger_value: number | null
          weather_source: string | null
        }
        Insert: {
          affected_property_count?: number | null
          alert_description?: string | null
          alert_title?: string | null
          blocked_sms_count?: number | null
          created_at?: string
          direct_mail_count?: number | null
          eligible_email_count?: number | null
          eligible_sms_count?: number | null
          id?: string
          market_id?: string | null
          recommended_action?: string | null
          rule_id?: string | null
          storm_event_id?: string | null
          storm_path_geojson?: Json | null
          trigger_status?: string | null
          trigger_threshold?: number | null
          trigger_type?: string | null
          trigger_value?: number | null
          weather_source?: string | null
        }
        Update: {
          affected_property_count?: number | null
          alert_description?: string | null
          alert_title?: string | null
          blocked_sms_count?: number | null
          created_at?: string
          direct_mail_count?: number | null
          eligible_email_count?: number | null
          eligible_sms_count?: number | null
          id?: string
          market_id?: string | null
          recommended_action?: string | null
          rule_id?: string | null
          storm_event_id?: string | null
          storm_path_geojson?: Json | null
          trigger_status?: string | null
          trigger_threshold?: number | null
          trigger_type?: string | null
          trigger_value?: number | null
          weather_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_trigger_events_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weather_trigger_events_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "auto_campaign_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weather_trigger_events_storm_event_id_fkey"
            columns: ["storm_event_id"]
            isOneToOne: false
            referencedRelation: "storm_events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
