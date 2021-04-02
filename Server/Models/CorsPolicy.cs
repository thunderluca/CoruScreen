namespace CoruScreen.Server.Models
{
    public class CorsPolicy
    {
        public bool AllowCredentials { get; set; }

        public string[] Headers { get; set; }

        public string[] Methods { get; set; }
        
        public string Name { get; set; }

        public string[] Origins { get; set; }
    }
}