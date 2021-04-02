using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Cors.Infrastructure;

namespace CoruScreen.Server.Models
{
    public static class CorsPolicyExtensions
    {
        public static bool AllowsAnyValue<T>(this CorsPolicy policy, Func<CorsPolicy, T> propertyFunc) where T : IList<string>
        {
            if (policy == null)
            {
                throw new ArgumentNullException(nameof(policy));
            }

            var collection = propertyFunc(policy);

            if (collection == null || collection.Count == 0)
            {
                return true;
            }

            if (collection.Count == 1 && collection[0]?.Trim() == "*")
            {
                return true;
            }

            return false;
        }

        public static CorsPolicyBuilder BuildUponPolicy(this CorsPolicyBuilder builder, CorsPolicy policy)
        {
            if (builder == null)
            {
                throw new ArgumentNullException(nameof(builder));
            }

            if (policy == null)
            {
                throw new ArgumentNullException(nameof(policy));
            }
 
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