using Microsoft.AspNetCore.Cors.Infrastructure;

namespace CoruScreen.Server.Models
{
    public static class CorsPolicyExtensions
    {
        public static bool AllowsAnyValue<T>(this CorsPolicy policy, Func<CorsPolicy, T> propertyFunc) where T : IList<string>
        {
            ArgumentNullException.ThrowIfNull(policy, nameof(policy));

            var collection = propertyFunc(policy);

            if (collection is null || collection.Count is 0)
            {
                return true;
            }

            if (collection.Count is 1 && collection[0]?.Trim() is "*")
            {
                return true;
            }

            return false;
        }

        public static CorsPolicyBuilder BuildUponPolicy(this CorsPolicyBuilder builder, CorsPolicy policy)
        {
            ArgumentNullException.ThrowIfNull(builder, nameof(builder));
            ArgumentNullException.ThrowIfNull(policy, nameof(policy));
 
            if (policy.AllowsAnyValue(p => p.Origins))
            {
                builder = builder.AllowAnyOrigin();
            }
            else
            {
                builder = builder.WithOrigins(policy.Origins);
            }
            
            if (policy.AllowsAnyValue(p => p.Headers))
            {
                builder = builder.AllowAnyHeader();
            }
            else
            {
                builder = builder.WithHeaders(policy.Headers);
            }
            
            if (policy.AllowsAnyValue(p => p.Methods))
            {
                builder = builder.AllowAnyMethod();
            }
            else
            {
                builder = builder.WithMethods(policy.Methods);
            }
            
            if (policy.AllowCredentials)
            {
                builder = builder.AllowCredentials();
            }
            else
            {
                builder = builder.DisallowCredentials();
            }

            return builder;
        }
    }
}