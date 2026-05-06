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
          sent_count: number
        }
        Insert: {
          channel?: string | null
          created_at?: string
          id?: string
          message?: string | null
          name?: string | null
          opt_out_count?: number
          sent_count?: number
        }
        Update: {
          channel?: string | null
          created_at?: string
          id?: string
          message?: string | null
          name?: string | null
          opt_out_count?: number
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
      leads: {
        Row: {
          assigned_rep: string | null
          created_at: string
          id: string
          lead_status: string
          notes: string | null
          property_id: string | null
          storm_event_id: string | null
          storm_score: number | null
        }
        Insert: {
          assigned_rep?: string | null
          created_at?: string
          id?: string
          lead_status?: string
          notes?: string | null
          property_id?: string | null
          storm_event_id?: string | null
          storm_score?: number | null
        }
        Update: {
          assigned_rep?: string | null
          created_at?: string
          id?: string
          lead_status?: string
          notes?: string | null
          property_id?: string | null
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
          id: string
          market_name: string
          market_type: string | null
          notes: string | null
          opportunity_score: number | null
          region: string | null
          state: string | null
          zip_codes: string[] | null
        }
        Insert: {
          cities?: string[] | null
          counties?: string[] | null
          created_at?: string
          id?: string
          market_name: string
          market_type?: string | null
          notes?: string | null
          opportunity_score?: number | null
          region?: string | null
          state?: string | null
          zip_codes?: string[] | null
        }
        Update: {
          cities?: string[] | null
          counties?: string[] | null
          created_at?: string
          id?: string
          market_name?: string
          market_type?: string | null
          notes?: string | null
          opportunity_score?: number | null
          region?: string | null
          state?: string | null
          zip_codes?: string[] | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
